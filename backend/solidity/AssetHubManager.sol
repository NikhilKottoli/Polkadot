// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./AssetStorage.sol";

contract AssetHubManager {
    bytes32 public constant ASSET_CREATOR_ROLE = keccak256("ASSET_CREATOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    address public admin;
    mapping(bytes32 => mapping(address => bool)) private _roles;
    AssetStorage public assetStorage;

    event AssetCreated(uint256 indexed assetId, bytes32 name, bytes32 symbol, uint8 decimals);
    // ... other events

    modifier onlyRole(bytes32 role) {
        require(_roles[role][msg.sender], "unauthorized");
        _;
    }

    constructor(address assetStorageAddress) {
        admin = msg.sender;
        _grantRole(ASSET_CREATOR_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(FREEZER_ROLE, msg.sender);
        assetStorage = AssetStorage(assetStorageAddress);
    }

    function createAsset(bytes32 name, bytes32 symbol, uint8 decimals) external onlyRole(ASSET_CREATOR_ROLE) returns (uint256) {
        uint256 assetId = assetStorage.createAsset(name, symbol, decimals);
        emit AssetCreated(assetId, name, symbol, decimals);
        return assetId;
    }

    // Implement other functions to interact with assetStorage...
    function _grantRole(bytes32 role, address account) internal {
        _roles[role][account] = true;
    }
}
