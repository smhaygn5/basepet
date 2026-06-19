// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";

/**
 * @title AccessoryShop (Faz5 — ERC-1155 UUPS)
 * @notice BasePet aksesuarları: tüketilebilir mama + nadir ödül eşyaları.
 *         Streak/seviye ödülleri `minter` (backend/dağıtıcı) tarafından mint edilir.
 *         Batch mint ile gas tasarrufu (plan §5.1).
 * @dev Token ID'leri `constants.ts` ile eşleşir. Sezonluk eşyalar 100+ ID aralığında.
 */
contract AccessoryShop is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ERC1155Upgradeable
{
    // Sabit ID'ler (frontend ACCESSORY_IDS ile birebir)
    uint256 public constant CAT_FOOD = 1;
    uint256 public constant COLLAR = 2;
    uint256 public constant PARTY_HAT = 3;
    uint256 public constant PREMIUM_FOOD = 4;
    uint256 public constant WALLPAPER = 5;

    /// @notice Ödül dağıtımı yapabilen adres (örn. backend cüzdanı / PetCore).
    address public minter;

    event MinterUpdated(address indexed newMinter);

    error NotAuthorized();
    error ZeroAddress();
    error LengthMismatch();

    modifier onlyMinter() {
        if (msg.sender != minter && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner, string memory uri_) external initializer {
        __ERC1155_init(uri_);
        __Ownable_init(initialOwner);
        minter = initialOwner;
        emit MinterUpdated(initialOwner);
    }

    // ─────────────────────────── Mint (ödül) ────────────────────────────

    function mint(address to, uint256 id, uint256 amount) external onlyMinter {
        _mint(to, id, amount, "");
    }

    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external onlyMinter {
        if (ids.length != amounts.length) revert LengthMismatch();
        _mintBatch(to, ids, amounts, "");
    }

    // ─────────────────────────── Admin ──────────────────────────────────

    function setMinter(address newMinter) external onlyOwner {
        if (newMinter == address(0)) revert ZeroAddress();
        minter = newMinter;
        emit MinterUpdated(newMinter);
    }

    function setURI(string calldata newuri) external onlyOwner {
        _setURI(newuri);
    }

    // ─────────────────────────── UUPS ───────────────────────────────────

    function _authorizeUpgrade(address) internal override onlyOwner {}

    uint256[48] private __gap;
}
