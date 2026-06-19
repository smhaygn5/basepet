// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";

/**
 * @title PetCore (Faz2 — UUPS upgradeable)
 * @notice Adres tabanlı on-chain evcil hayvan bakım oyunu çekirdeği.
 *         Her bakım eylemi bir zaman damgası ve XP olarak zincire yazılır.
 * @dev UUPS proxy arkasında çalışır. CEI deseni + ReentrancyGuard + Pausable.
 *      Logic sözleşmesi constructor'da `_disableInitializers()` ile kilitlenir.
 */
contract PetCore is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient
{
    enum ActionType {
        FEED,
        PLAY,
        SLEEP,
        BATH,
        TOILET
    }

    struct Pet {
        string name;
        uint256 totalXP;
        uint256 level;
        uint256 createdAt;
        uint256 lastFedTimestamp;
        uint256 lastPlayedTimestamp;
        uint256 lastSleptTimestamp;
        uint256 lastBathedTimestamp;
        uint256 lastToiletTimestamp;
    }

    struct ActionConfig {
        uint256 xpReward;
        uint256 cooldownSeconds;
        bool isActive;
    }

    mapping(address => Pet) public pets;
    mapping(ActionType => ActionConfig) public actionConfigs;

    /// @notice Acil durdurma yetkisi (guardian/multisig). Owner (timelock) yerine
    ///         hızlı pause için ayrı rol — upgrade'ler 48s timelock'ta beklerken
    ///         pause anında yapılabilir.
    address public pauser;

    event PauserUpdated(address indexed newPauser);
    event PetCreated(address indexed owner, string name, uint256 timestamp);
    event ActionPerformed(
        address indexed owner,
        ActionType actionType,
        uint256 xpGained,
        uint256 timestamp
    );
    event LevelUp(address indexed owner, uint256 newLevel, uint256 totalXP);

    error PetAlreadyExists();
    error PetNotFound();
    error EmptyName();
    error ActionNotActive();
    error CooldownActive(uint256 readyAt);
    error NotPauser();
    error ZeroAddress();

    modifier onlyPauser() {
        if (msg.sender != pauser) revert NotPauser();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __Pausable_init();
        // UUPSUpgradeable (OZ v5) init gerektirmez; _authorizeUpgrade override yeter.
        // ReentrancyGuardTransient transient storage kullanır; init gerekmez.

        // Başlangıçta pauser = owner; production'da setPauser ile guardian'a devredilir.
        pauser = initialOwner;
        emit PauserUpdated(initialOwner);

        // Varsayılan aksiyon konfigürasyonları: +50 XP, 5 dk cooldown.
        _setActionConfig(ActionType.FEED, 50, 5 minutes, true);
        _setActionConfig(ActionType.PLAY, 50, 5 minutes, true);
        _setActionConfig(ActionType.SLEEP, 50, 5 minutes, true);
        _setActionConfig(ActionType.BATH, 50, 5 minutes, true);
        _setActionConfig(ActionType.TOILET, 50, 5 minutes, true);
    }

    // ─────────────────────────── Pet yönetimi ───────────────────────────

    function createPet(string calldata name) external whenNotPaused {
        if (pets[msg.sender].createdAt != 0) revert PetAlreadyExists();
        if (bytes(name).length == 0) revert EmptyName();

        Pet storage pet = pets[msg.sender];
        pet.name = name;
        pet.level = 1;
        pet.createdAt = block.timestamp;

        emit PetCreated(msg.sender, name, block.timestamp);
    }

    // ─────────────────── Kullanıcı dostu wrapper'lar ────────────────────

    function feedPet() external {
        performAction(ActionType.FEED);
    }

    function playWithPet() external {
        performAction(ActionType.PLAY);
    }

    function sleepPet() external {
        performAction(ActionType.SLEEP);
    }

    function bathPet() external {
        performAction(ActionType.BATH);
    }

    function toiletPet() external {
        performAction(ActionType.TOILET);
    }

    // ─────────────────────────── Çekirdek mantık ─────────────────────────

    function performAction(ActionType action)
        public
        whenNotPaused
        nonReentrant
    {
        // Checks
        Pet storage pet = pets[msg.sender];
        if (pet.createdAt == 0) revert PetNotFound();

        ActionConfig memory config = actionConfigs[action];
        if (!config.isActive) revert ActionNotActive();

        // İlk aksiyon (lastTimestamp == 0) cooldown'suz; sonrakiler kontrol edilir.
        uint256 lastTimestamp = _getLastTimestamp(pet, action);
        if (lastTimestamp != 0) {
            uint256 readyAt = lastTimestamp + config.cooldownSeconds;
            if (block.timestamp < readyAt) revert CooldownActive(readyAt);
        }

        // Effects
        _setLastTimestamp(pet, action, block.timestamp);
        pet.totalXP += config.xpReward;

        uint256 newLevel = _calculateLevel(pet.totalXP);
        if (newLevel > pet.level) {
            pet.level = newLevel;
            emit LevelUp(msg.sender, newLevel, pet.totalXP);
        }

        // Interaction (sadece event emit)
        emit ActionPerformed(msg.sender, action, config.xpReward, block.timestamp);
    }

    // ─────────────────────────── Görünüm (view) ─────────────────────────

    function getPet(address owner) external view returns (Pet memory) {
        return pets[owner];
    }

    function hasPet(address owner) external view returns (bool) {
        return pets[owner].createdAt != 0;
    }

    // ─────────────────────────── Admin ──────────────────────────────────

    function setActionConfig(
        ActionType action,
        uint256 xpReward,
        uint256 cooldownSeconds,
        bool isActive
    ) external onlyOwner {
        _setActionConfig(action, xpReward, cooldownSeconds, isActive);
    }

    /// @notice Acil durdurma — guardian/multisig (timelock gecikmesi olmadan).
    function pause() external onlyPauser {
        _pause();
    }

    function unpause() external onlyPauser {
        _unpause();
    }

    /// @notice Pauser rolünü devret (yalnızca owner = timelock).
    function setPauser(address newPauser) external onlyOwner {
        if (newPauser == address(0)) revert ZeroAddress();
        pauser = newPauser;
        emit PauserUpdated(newPauser);
    }

    // ─────────────────────────── İç yardımcılar ─────────────────────────

    function _setActionConfig(
        ActionType action,
        uint256 xpReward,
        uint256 cooldownSeconds,
        bool isActive
    ) internal {
        actionConfigs[action] = ActionConfig(xpReward, cooldownSeconds, isActive);
    }

    function _getLastTimestamp(Pet storage pet, ActionType action)
        internal
        view
        returns (uint256)
    {
        if (action == ActionType.FEED) return pet.lastFedTimestamp;
        if (action == ActionType.PLAY) return pet.lastPlayedTimestamp;
        if (action == ActionType.SLEEP) return pet.lastSleptTimestamp;
        if (action == ActionType.BATH) return pet.lastBathedTimestamp;
        return pet.lastToiletTimestamp; // TOILET
    }

    function _setLastTimestamp(
        Pet storage pet,
        ActionType action,
        uint256 ts
    ) internal {
        if (action == ActionType.FEED) pet.lastFedTimestamp = ts;
        else if (action == ActionType.PLAY) pet.lastPlayedTimestamp = ts;
        else if (action == ActionType.SLEEP) pet.lastSleptTimestamp = ts;
        else if (action == ActionType.BATH) pet.lastBathedTimestamp = ts;
        else pet.lastToiletTimestamp = ts; // TOILET
    }

    /// @notice level = floor(sqrt(totalXP / 100)), minimum 1.
    function _calculateLevel(uint256 totalXP) internal pure returns (uint256) {
        uint256 lvl = _sqrt(totalXP / 100);
        return lvl < 1 ? 1 : lvl;
    }

    /// @dev Babylonian (Newton) yöntemi ile tamsayı karekök.
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    // ─────────────────────────── UUPS ───────────────────────────────────

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    /// @dev Storage layout için boşluk (gelecekteki değişkenler). `pauser` eklendi → 44.
    uint256[44] private __gap;
}
