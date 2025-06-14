require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Get token from .env
const token = process.env.TELEGRAM_BOT_TOKEN || "7820317518:AAEJPAogcSqkghN3hEq772-s25o_QcaOO0Y";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Store user chat IDs (in production, use a database)
const userChatIds = new Map();

// Listen for any kind of message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`Received message from chat ID: ${chatId}`);
  
  // Store the chat ID
  userChatIds.set(msg.from.id.toString(), chatId);

  // Reply to user
  bot.sendMessage(chatId, 'Hello from Polkaflow bot! Your chat ID is: ' + chatId);
});

// Function to send a message with better error handling
async function sendTelegramMessage(chatId, text) {
  try {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    
    const message = await bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    
    return { success: true, messageId: message.message_id };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

// Function to get chat ID for a user
function getUserChatId(userId) {
  return userChatIds.get(userId.toString());
}

// Export the functions
module.exports = { 
  sendTelegramMessage,
  getUserChatId
};
