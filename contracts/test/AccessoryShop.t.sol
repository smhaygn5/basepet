// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AccessoryShop} from "../src/AccessoryShop.sol";

contract AccessoryShopTest is Test {
    AccessoryShop internal shop;
    address internal owner = address(this);
    address internal minter = makeAddr("minter");
    address internal alice = makeAddr("alice");

    function setUp() public {
        AccessoryShop impl = new AccessoryShop();
        bytes memory initData = abi.encodeCall(
            AccessoryShop.initialize,
            (owner, "https://basepet.app/api/metadata/{id}.json")
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        shop = AccessoryShop(address(proxy));
    }

    function test_OwnerCanMint() public {
        shop.mint(alice, shop.CAT_FOOD(), 5);
        assertEq(shop.balanceOf(alice, shop.CAT_FOOD()), 5);
    }

    function test_BatchMint() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = shop.COLLAR();
        ids[1] = shop.PARTY_HAT();
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1;
        amounts[1] = 2;
        shop.mintBatch(alice, ids, amounts);
        assertEq(shop.balanceOf(alice, shop.COLLAR()), 1);
        assertEq(shop.balanceOf(alice, shop.PARTY_HAT()), 2);
    }

    function test_MinterCanMint() public {
        shop.setMinter(minter);
        vm.prank(minter);
        shop.mint(alice, shop.PREMIUM_FOOD(), 3);
        assertEq(shop.balanceOf(alice, shop.PREMIUM_FOOD()), 3);
    }

    function test_RevertWhen_UnauthorizedMint() public {
        uint256 id = shop.CAT_FOOD();
        vm.prank(alice);
        vm.expectRevert(AccessoryShop.NotAuthorized.selector);
        shop.mint(alice, id, 1);
    }

    function test_RevertWhen_NonOwnerSetsMinter() public {
        vm.prank(alice);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        shop.setMinter(alice);
    }

    function test_RevertWhen_SetMinterZero() public {
        vm.expectRevert(AccessoryShop.ZeroAddress.selector);
        shop.setMinter(address(0));
    }

    function test_BatchLengthMismatch() public {
        uint256[] memory ids = new uint256[](2);
        uint256[] memory amounts = new uint256[](1);
        vm.expectRevert(AccessoryShop.LengthMismatch.selector);
        shop.mintBatch(alice, ids, amounts);
    }

    function test_TransfersWork() public {
        uint256 id = shop.CAT_FOOD();
        shop.mint(alice, id, 5);
        vm.prank(alice);
        shop.safeTransferFrom(alice, minter, id, 2, "");
        assertEq(shop.balanceOf(alice, id), 3);
        assertEq(shop.balanceOf(minter, id), 2);
    }
}
