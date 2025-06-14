const express = require('express');
const router = express.Router();
const { sendTelegramMessage, getUserChatId } = require('../polkaflow-telegram-bot');

// Middleware to validate chat ID
const validateChatId = (req, res, next) => {
  const { chatId } = req.body;
  if (!chatId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Chat ID is required' 
    });
  }
  next();
};

// Send Telegram message
router.post('/send', validateChatId, async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const result = await sendTelegramMessage(chatId, text);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in /send-telegram:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user's chat ID
router.get('/chat-id/:userId', (req, res) => {
  const { userId } = req.params;
  const chatId = getUserChatId(userId);
  
  if (!chatId) {
    return res.status(404).json({ 
      success: false, 
      error: 'Chat ID not found for this user' 
    });
  }
  
  res.json({ success: true, chatId });
});

module.exports = router; 