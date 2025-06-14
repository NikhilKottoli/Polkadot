require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Get token from .env
const token = "7820317518:AAEJPAogcSqkghN3hEq772-s25o_QcaOO0Y";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message (for testing)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`Received message from chat ID: ${chatId}`);

  // Reply to user
  bot.sendMessage(chatId, 'Hello from Polkaflow bot! Your chat ID is: ' + chatId);
});

// Function to send a message (export for use in your workflow backend)
function sendTelegramMessage(chatId, text) {
  return bot.sendMessage(chatId, text);
}

// Export the function if you want to use it in another file
module.exports = { sendTelegramMessage };
