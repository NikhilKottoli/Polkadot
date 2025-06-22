require('dotenv').config();

// Telegram Bot Configuration
const TELEGRAM_CONFIG = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "7820317518:AAEJPAogcSqkghN3hEq772-s25o_QcaOO0Y",
  CHAT_ID: process.env.CHAT_ID || "255522477",
  ENABLE_NOTIFICATIONS: process.env.ENABLE_TELEGRAM_NOTIFICATIONS !== 'false',
  
  // Event types to monitor for telegram notifications
  MONITORED_EVENTS: [
    'SendTelegram',
    'SendTelegramNotification', 
    'TelegramNotify',
    'NotifyTelegram',
    'SendNotification'
  ],
  
  // Monitoring settings
  MONITOR_INTERVAL: parseInt(process.env.MONITOR_INTERVAL) || 10000,
  DEBUG_MODE: process.env.DEBUG_MODE === 'true'
};

// Blockchain Configuration
const BLOCKCHAIN_CONFIG = {
  RPC_URL: process.env.ETH_RPC_URL || "https://testnet-passet-hub-eth-rpc.polkadot.io",
  PRIVATE_KEY: process.env.PRIVATE_KEY || ""
};

module.exports = {
  TELEGRAM_CONFIG,
  BLOCKCHAIN_CONFIG
}; 