// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {PetCore} from "../src/PetCore.sol";

/**
 * Production (mainnet) deploy — güvenlik final (plan §4.1/§4.2).
 *
 * Akış:
 *  1. TimelockController (48s gecikme) — proposer/executor = Gnosis Safe multisig
 *  2. PetCore impl + ERC1967 proxy, initialize(deployer)
 *  3. setPauser(guardian) — acil pause guardian/multisig'de (timelock gecikmesi yok)
 *  4. transferOwnership(timelock) — upgrade/setActionConfig 48s timelock'tan geçer
 *
 * Env:
 *  MULTISIG_ADDRESS  — Gnosis Safe (proposer + executor)
 *  GUARDIAN_ADDRESS  — acil pause yetkisi (yoksa MULTISIG)
 *  (yereldeyse hepsi msg.sender'a düşer)
 *
 * Çalıştırma (Base Mainnet):
 *  forge script script/DeployProduction.s.sol:DeployProduction \
 *    --rpc-url <BASE_RPC> --broadcast --private-key $DEPLOYER_KEY --verify
 */
contract DeployProduction is Script {
    uint256 constant TIMELOCK_DELAY = 48 hours;

    function run() external returns (address proxy, address timelock) {
        address multisig = vm.envOr("MULTISIG_ADDRESS", msg.sender);
        address guardian = vm.envOr("GUARDIAN_ADDRESS", multisig);

        vm.startBroadcast();

        // 1. Timelock (admin=address(0) → kendinden yönetilir)
        address[] memory proposers = new address[](1);
        proposers[0] = multisig;
        address[] memory executors = new address[](1);
        executors[0] = multisig;
        TimelockController tl = new TimelockController(
            TIMELOCK_DELAY,
            proposers,
            executors,
            address(0)
        );

        // 2. Impl + proxy
        PetCore impl = new PetCore();
        bytes memory initData = abi.encodeCall(PetCore.initialize, (msg.sender));
        ERC1967Proxy proxyContract = new ERC1967Proxy(address(impl), initData);
        PetCore pet = PetCore(address(proxyContract));

        // 3. Acil pause guardian'a
        pet.setPauser(guardian);

        // 4. Sahipliği timelock'a devret (upgrade/admin 48s gecikmeli)
        pet.transferOwnership(address(tl));

        proxy = address(proxyContract);
        timelock = address(tl);

        console.log("PetCore proxy:", proxy);
        console.log("PetCore impl :", address(impl));
        console.log("Timelock     :", timelock);
        console.log("Multisig     :", multisig);
        console.log("Guardian     :", guardian);

        vm.stopBroadcast();
    }
}
