// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {PetCore} from "../src/PetCore.sol";

/// @dev Upgrade testi için minimal V2 (yeni bir fonksiyon ekler).
contract PetCoreV2 is PetCore {
    function version() external pure returns (string memory) {
        return "v2";
    }
}

contract PetCoreTest is Test {
    PetCore internal pet;

    address internal owner = address(this);
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        vm.warp(1_700_000_000); // gerçekçi başlangıç zamanı

        // UUPS: implementation + proxy + initialize(owner = this)
        PetCore impl = new PetCore();
        bytes memory initData = abi.encodeCall(PetCore.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        pet = PetCore(address(proxy));
    }

    // ─────────────────────────── Init / UUPS ────────────────────────────

    function test_OwnerSetByInitialize() public view {
        assertEq(pet.owner(), owner);
    }

    function test_RevertWhen_InitializeTwice() public {
        vm.expectRevert(); // InvalidInitialization
        pet.initialize(alice);
    }

    function test_Upgrade() public {
        PetCoreV2 v2 = new PetCoreV2();
        pet.upgradeToAndCall(address(v2), "");
        assertEq(PetCoreV2(address(pet)).version(), "v2");
        // State korunur:
        vm.prank(alice);
        pet.createPet("Mochi");
        assertTrue(pet.hasPet(alice));
    }

    function test_RevertWhen_NonOwnerUpgrades() public {
        PetCoreV2 v2 = new PetCoreV2();
        vm.prank(alice);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        pet.upgradeToAndCall(address(v2), "");
    }

    // ─────────────────────────── createPet ──────────────────────────────

    function test_CreatePet() public {
        vm.prank(alice);
        pet.createPet("Mochi");

        assertTrue(pet.hasPet(alice));
        PetCore.Pet memory p = pet.getPet(alice);
        assertEq(p.name, "Mochi");
        assertEq(p.level, 1);
        assertEq(p.totalXP, 0);
        assertGt(p.createdAt, 0);
    }

    function test_RevertWhen_CreatePetTwice() public {
        vm.startPrank(alice);
        pet.createPet("Mochi");
        vm.expectRevert(PetCore.PetAlreadyExists.selector);
        pet.createPet("Second");
        vm.stopPrank();
    }

    function test_RevertWhen_EmptyName() public {
        vm.prank(alice);
        vm.expectRevert(PetCore.EmptyName.selector);
        pet.createPet("");
    }

    // ─────────────────────────── performAction ──────────────────────────

    function test_RevertWhen_ActionWithoutPet() public {
        vm.prank(alice);
        vm.expectRevert(PetCore.PetNotFound.selector);
        pet.feedPet();
    }

    function test_FeedGivesXP() public {
        vm.startPrank(alice);
        pet.createPet("Mochi");
        pet.feedPet();
        vm.stopPrank();

        PetCore.Pet memory p = pet.getPet(alice);
        assertEq(p.totalXP, 50);
        assertGt(p.lastFedTimestamp, 0);
    }

    function test_RevertWhen_CooldownActive() public {
        vm.startPrank(alice);
        pet.createPet("Mochi");
        pet.feedPet();
        vm.expectRevert(); // CooldownActive(readyAt)
        pet.feedPet();
        vm.stopPrank();
    }

    function test_FeedAgainAfterCooldown() public {
        vm.startPrank(alice);
        pet.createPet("Mochi");
        pet.feedPet();
        vm.warp(block.timestamp + 5 minutes);
        pet.feedPet();
        vm.stopPrank();

        assertEq(pet.getPet(alice).totalXP, 100);
    }

    function test_DifferentActionsNoCrossCooldown() public {
        vm.startPrank(alice);
        pet.createPet("Mochi");
        pet.feedPet();
        pet.playWithPet(); // farklı aksiyon, cooldown ayrı
        pet.sleepPet();
        vm.stopPrank();

        assertEq(pet.getPet(alice).totalXP, 150);
    }

    function test_LevelUp() public {
        // Cooldown'u sıfırla ki hızlı XP biriktirelim.
        pet.setActionConfig(PetCore.ActionType.FEED, 50, 0, true);

        vm.startPrank(alice);
        pet.createPet("Mochi");
        // 8 feed = 400 XP → level = floor(sqrt(400/100)) = 2
        for (uint256 i = 0; i < 8; i++) {
            pet.feedPet();
        }
        vm.stopPrank();

        PetCore.Pet memory p = pet.getPet(alice);
        assertEq(p.totalXP, 400);
        assertEq(p.level, 2);
    }

    function test_LevelUpEmitsEvent() public {
        pet.setActionConfig(PetCore.ActionType.FEED, 400, 0, true);

        vm.startPrank(alice);
        pet.createPet("Mochi");
        vm.expectEmit(true, false, false, true);
        emit PetCore.LevelUp(alice, 2, 400);
        pet.feedPet();
        vm.stopPrank();
    }

    function test_ActionPerformedEmitsEvent() public {
        vm.startPrank(alice);
        pet.createPet("Mochi");
        vm.expectEmit(true, false, false, true);
        emit PetCore.ActionPerformed(alice, PetCore.ActionType.FEED, 50, block.timestamp);
        pet.feedPet();
        vm.stopPrank();
    }

    // ─────────────────────────── Pause ──────────────────────────────────

    function test_RevertWhen_PausedAction() public {
        vm.prank(alice);
        pet.createPet("Mochi");

        pet.pause();

        vm.prank(alice);
        vm.expectRevert(); // Pausable: EnforcedPause
        pet.feedPet();
    }

    function test_UnpauseRestoresActions() public {
        vm.prank(alice);
        pet.createPet("Mochi");
        pet.pause();
        pet.unpause();

        vm.prank(alice);
        pet.feedPet();
        assertEq(pet.getPet(alice).totalXP, 50);
    }

    // ─────────────────────────── Pauser rol ayrımı ──────────────────────

    function test_PauserSetByInitialize() public view {
        assertEq(pet.pauser(), owner);
    }

    function test_RevertWhen_NonPauserPauses() public {
        vm.prank(alice);
        vm.expectRevert(PetCore.NotPauser.selector);
        pet.pause();
    }

    function test_OwnerCanSetPauserAndNewPauserControls() public {
        pet.setPauser(alice);
        assertEq(pet.pauser(), alice);

        // Eski pauser (owner) artık pause edemez
        vm.expectRevert(PetCore.NotPauser.selector);
        pet.pause();

        // Yeni pauser (alice) edebilir
        vm.prank(alice);
        pet.pause();
        assertTrue(pet.paused());
    }

    function test_RevertWhen_NonOwnerSetsPauser() public {
        vm.prank(alice);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        pet.setPauser(alice);
    }

    function test_RevertWhen_SetPauserZero() public {
        vm.expectRevert(PetCore.ZeroAddress.selector);
        pet.setPauser(address(0));
    }

    // ─────────────────────────── Admin / Access ─────────────────────────

    function test_RevertWhen_NonOwnerSetsConfig() public {
        vm.prank(alice);
        vm.expectRevert(); // Ownable: OwnableUnauthorizedAccount
        pet.setActionConfig(PetCore.ActionType.FEED, 100, 0, true);
    }

    function test_RevertWhen_ActionDeactivated() public {
        pet.setActionConfig(PetCore.ActionType.FEED, 50, 5 minutes, false);

        vm.startPrank(alice);
        pet.createPet("Mochi");
        vm.expectRevert(PetCore.ActionNotActive.selector);
        pet.feedPet();
        vm.stopPrank();
    }

    function test_TwoUsersIndependent() public {
        vm.prank(alice);
        pet.createPet("Mochi");
        vm.prank(bob);
        pet.createPet("Pesto");

        vm.prank(alice);
        pet.feedPet();

        assertEq(pet.getPet(alice).totalXP, 50);
        assertEq(pet.getPet(bob).totalXP, 0);
    }

    // ─────────────────────────── Fuzz ───────────────────────────────────

    function testFuzz_CreatePetWithName(string calldata name) public {
        vm.assume(bytes(name).length > 0 && bytes(name).length <= 64);
        vm.prank(alice);
        pet.createPet(name);
        assertEq(pet.getPet(alice).name, name);
    }
}
