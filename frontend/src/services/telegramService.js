import { ethers } from 'ethers';

class TelegramService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.userChatId = null;
  }

  // Initialize the service with contract address and ABI
  async initialize(contractAddress, contractABI, userChatId) {
    this.userChatId = userChatId;
    
    // Connect to provider (assuming MetaMask or similar)
    if (window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
      
      // Set up event listener
      this.setupEventListener();
    } else {
      throw new Error('Please install MetaMask or another Web3 wallet');
    }
  }

  // Set up event listener for SendTelegram events
  setupEventListener() {
    if (!this.contract) return;

    this.contract.on('SendTelegram', async (message, user) => {
      try {
        // Get the current user's address
        const accounts = await this.provider.listAccounts();
        const currentUser = accounts[0];

        // Only process events for the current user
        if (user.toLowerCase() === currentUser.toLowerCase()) {
          await this.sendTelegramMessage(message);
        }
      } catch (error) {
        console.error('Error processing Telegram event:', error);
      }
    });
  }

  // Send message to Telegram via backend API
  async sendTelegramMessage(message) {
    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: this.userChatId,
          text: message,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      throw error;
    }
  }

  // Set user's Telegram chat ID in the contract
  async setTelegramChatId(chatId) {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const signer = this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);
      
      const tx = await contractWithSigner.setTelegramChatId(chatId);
      await tx.wait();
      
      this.userChatId = chatId;
      return true;
    } catch (error) {
      console.error('Error setting Telegram chat ID:', error);
      throw error;
    }
  }

  // Get user's Telegram chat ID from the contract
  async getTelegramChatId(userAddress) {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const chatId = await this.contract.getTelegramChatId(userAddress);
      return chatId;
    } catch (error) {
      console.error('Error getting Telegram chat ID:', error);
      throw error;
    }
  }

  // Clean up event listeners
  cleanup() {
    if (this.contract) {
      this.contract.removeAllListeners('SendTelegram');
    }
  }
}

export default new TelegramService(); 