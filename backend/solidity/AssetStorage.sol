// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract AssetStorage {
    struct Asset {
        bytes32 name;
        bytes32 symbol;
        uint8 decimals;
        uint256 totalSupply;
        bool exists;
    }

    mapping(uint256 => Asset) public assets;
    mapping(uint256 => mapping(address => uint256)) public balances;
    mapping(uint256 => mapping(address => bool)) public frozen;
    uint256 public assetCount;

    function createAsset(bytes32 name, bytes32 symbol, uint8 decimals) external returns (uint256) {
        uint256 assetId = assetCount;
        assets[assetId] = Asset(name, symbol, decimals, 0, true);
        assetCount += 1;
        return assetId;
    }

    // Add other storage-related functions as needed...
}
