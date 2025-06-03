// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AssetHubManager is AccessControl {
    bytes32 public constant ASSET_CREATOR_ROLE = keccak256("ASSET_CREATOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    struct Asset {
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        mapping(address => uint256) balances;
        mapping(address => bool) frozen;
        bool exists;
    }

    mapping(uint256 => Asset) private assets;
    uint256 public assetCount;

    event AssetCreated(uint256 indexed assetId, string name, string symbol, uint8 decimals);
    event AssetMinted(uint256 indexed assetId, address indexed to, uint256 amount);
    event AssetFrozen(uint256 indexed assetId, address indexed account, bool frozen);
    event Transfer(uint256 indexed assetId, address indexed from, address indexed to, uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ASSET_CREATOR_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(FREEZER_ROLE, msg.sender);
    }

    function createAsset(string memory name, string memory symbol, uint8 decimals) external onlyRole(ASSET_CREATOR_ROLE) returns (uint256) {
        uint256 assetId = assetCount;
        Asset storage asset = assets[assetId];
        asset.name = name;
        asset.symbol = symbol;
        asset.decimals = decimals;
        asset.exists = true;
        asset.totalSupply = 0;
        emit AssetCreated(assetId, name, symbol, decimals);
        assetCount += 1;
        return assetId;
    }

    function mint(uint256 assetId, address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(assets[assetId].exists, "Asset does not exist");
        require(to != address(0), "Invalid address");
        require(!assets[assetId].frozen[to], "Account is frozen");
        assets[assetId].balances[to] += amount;
        assets[assetId].totalSupply += amount;
        emit AssetMinted(assetId, to, amount);
        emit Transfer(assetId, address(0), to, amount);
    }

    function freeze(uint256 assetId, address account, bool freezeStatus) external onlyRole(FREEZER_ROLE) {
        require(assets[assetId].exists, "Asset does not exist");
        assets[assetId].frozen[account] = freezeStatus;
        emit AssetFrozen(assetId, account, freezeStatus);
    }

    function balanceOf(uint256 assetId, address account) external view returns (uint256) {
        require(assets[assetId].exists, "Asset does not exist");
        return assets[assetId].balances[account];
    }

    function isFrozen(uint256 assetId, address account) external view returns (bool) {
        require(assets[assetId].exists, "Asset does not exist");
        return assets[assetId].frozen[account];
    }

    function assetInfo(uint256 assetId) external view returns (string memory, string memory, uint8, uint256) {
        require(assets[assetId].exists, "Asset does not exist");
        Asset storage asset = assets[assetId];
        return (asset.name, asset.symbol, asset.decimals, asset.totalSupply);
    }
}
