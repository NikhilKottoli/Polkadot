// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TelegramContract {
    // Event for sending Telegram messages
    event SendTelegram(string message, address indexed user);
    
    // Mapping to store user's Telegram chat IDs
    mapping(address => string) private userChatIds;
    
    // Contract owner
    address private owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Set user's Telegram chat ID
    function setTelegramChatId(string memory chatId) external {
        userChatIds[msg.sender] = chatId;
    }
    
    // Get user's Telegram chat ID
    function getTelegramChatId(address user) external view returns (string memory) {
        return userChatIds[user];
    }
    
    // Function to send a Telegram message
    function sendTelegramMessage(string memory message) external {
        require(bytes(userChatIds[msg.sender]).length > 0, "Telegram chat ID not set");
        emit SendTelegram(message, msg.sender);
    }
    
    // Example function that includes Telegram notification
    function createAsset(string memory assetName) external {
        // Your asset creation logic here
        
        // Send Telegram notification
        string memory message = string(abi.encodePacked(
            "New asset created: ", 
            assetName,
            " by ",
            toAsciiString(msg.sender)
        ));
        emit SendTelegram(message, msg.sender);
    }
    
    // Helper function to convert address to string
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }
    
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
} 