import telegramService from './telegramService';

class TelegramCodegen {
  constructor() {
    this.contractName = 'TelegramContract';
    this.contractAddress = null;
  }

  // Initialize with contract address
  async initialize(contractAddress) {
    this.contractAddress = contractAddress;
    await telegramService.initialize(contractAddress);
  }

  // Convert a Telegram node to Solidity code
  generateNodeCode(node) {
    const { properties } = node.data;
    const { chat_id, message_template, variables } = properties;

    // Generate variable declarations
    const variableDeclarations = Object.entries(variables)
      .map(([key, value]) => `string memory ${key} = "${value}";`)
      .join('\n    ');

    // Generate message formatting
    let formattedMessage = message_template;
    Object.keys(variables).forEach(key => {
      formattedMessage = formattedMessage.replace(
        new RegExp(`{${key}}`, 'g'),
        `" + ${key} + "`
      );
    });

    // Generate the function code
    return `
    // Telegram notification
    ${variableDeclarations}
    string memory message = "${formattedMessage}";
    emit SendTelegram(message, msg.sender);
    `;
  }

  // Generate contract code with Telegram event
  generateContractCode() {
    return `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ${this.contractName} {
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
}`;
  }

  // Generate deployment code
  generateDeploymentCode() {
    return `
    // Deploy Telegram contract
    const telegramContract = await ethers.getContractFactory("${this.contractName}");
    const telegram = await telegramContract.deploy();
    await telegram.deployed();
    
    // Set chat ID for the deployer
    await telegram.setTelegramChatId("${this.chatId}");
    `;
  }
}

export default new TelegramCodegen(); 