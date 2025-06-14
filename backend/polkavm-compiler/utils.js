const { ethers } = require('ethers');
const { sendTelegramMessage } = require('../polkaflow-telegram-bot');

// Store monitoring intervals and contract info
const monitoringIntervals = new Map();
const deployedContracts = new Map();

// Function to poll for events instead of using filters (Polkadot RPC doesn't support eth_newFilter)
async function pollForEvents(contractAddress, abi, contractName, fromBlock = 'latest') {
  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const currentBlock = await provider.getBlockNumber();
    
    // Get the last processed block for this contract, or start from current
    const lastProcessedKey = `lastBlock_${contractAddress}`;
    let lastProcessedBlock = parseInt(process.env[lastProcessedKey] || currentBlock - 10); // Check last 10 blocks
    
    if (lastProcessedBlock >= currentBlock) {
      return; // No new blocks to check
    }
    
    console.log(`🔍 [Monitor] Checking blocks ${lastProcessedBlock + 1} to ${currentBlock} for ${contractName}`);
    
    // Query events in the block range
    const filter = contract.filters.SendTelegram();
    const events = await contract.queryFilter(filter, lastProcessedBlock + 1, currentBlock);
    
    if (events.length > 0) {
      console.log(`📨 [Monitor] Found ${events.length} SendTelegram events from ${contractName}`);
      
      for (const event of events) {
        const { message, user } = event.args;
        
        console.log(`📨 SendTelegram event from ${contractName}:`, { message, user, block: event.blockNumber });
        
        // Send Telegram notification
        try {
          await sendTelegramMessage(process.env.CHAT_ID,
            `📨 Contract Event Detected!\n` +
            `📍 Contract: ${contractName}\n` +
            `🔗 Address: ${contractAddress.slice(0, 10)}...\n` +
            `👤 User: ${user.slice(0, 10)}...\n` +
            `📝 Message: ${message}\n` +
            `🧱 Block: ${event.blockNumber}\n` +
            `🕒 Time: ${new Date().toLocaleString()}`
          );
          console.log(`✅ [Monitor] Telegram notification sent for ${contractName}`);
        } catch (telegramError) {
          console.error('❌ [Monitor] Failed to send Telegram notification:', telegramError);
        }
      }
    }
    
    // Update last processed block
    process.env[lastProcessedKey] = currentBlock.toString();
    
  } catch (error) {
    console.error(`❌ [Monitor] Error polling events for ${contractName}:`, error.message);
  }
}

// Function to set up polling-based event monitoring for a contract
function setupEventMonitoring(contractAddress, abi, contractName = 'Unknown') {
  try {
    console.log(`📡 [Monitor] Setting up polling for ${contractName} at ${contractAddress}`);
    
    // Clear existing interval if it exists
    const existingInterval = monitoringIntervals.get(contractAddress);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    // Start polling every 10 seconds
    const interval = setInterval(() => {
      pollForEvents(contractAddress, abi, contractName);
    }, 10000);
    
    // Store contract info and interval
    deployedContracts.set(contractAddress, {
      abi,
      name: contractName,
      deployedAt: new Date()
    });
    
    monitoringIntervals.set(contractAddress, interval);
    
    console.log(`✅ [Monitor] Polling set up for ${contractName} at ${contractAddress}`);
    
  } catch (error) {
    console.error(`❌ [Monitor] Failed to set up polling for ${contractAddress}:`, error);
  }
}

module.exports = {
  pollForEvents,
  setupEventMonitoring
};