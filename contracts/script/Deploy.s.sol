// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {PetCore} from "../src/PetCore.sol";
import {AccessoryShop} from "../src/AccessoryShop.sol";

/**
 * Yerel/dev deploy: PetCore + AccessoryShop (UUPS proxy + initialize).
 *  Yerel (anvil):  forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key <ANVIL_KEY>
 *  (Mainnet/Timelock için: DeployProduction.s.sol)
 */
contract Deploy is Script {
    function run() external returns (address petProxy, address shopProxy) {
        vm.startBroadcast();

        // PetCore (önce — proxy adresi sabit kalsın diye)
        PetCore petImpl = new PetCore();
        bytes memory petInit = abi.encodeCall(PetCore.initialize, (msg.sender));
        petProxy = address(new ERC1967Proxy(address(petImpl), petInit));

        // AccessoryShop (ERC-1155)
        AccessoryShop shopImpl = new AccessoryShop();
        bytes memory shopInit = abi.encodeCall(
            AccessoryShop.initialize,
            (msg.sender, "https://basepet.app/api/metadata/{id}.json")
        );
        shopProxy = address(new ERC1967Proxy(address(shopImpl), shopInit));

        console.log("PetCore proxy     :", petProxy);
        console.log("AccessoryShop proxy:", shopProxy);

        vm.stopBroadcast();
    }
}
