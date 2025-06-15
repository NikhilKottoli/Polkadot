const { ethers } = require('ethers');
const { sendTelegramMessage } = require('../polkaflow-telegram-bot');
const { TELEGRAM_CONFIG, BLOCKCHAIN_CONFIG } = require('./telegram-config');

// Store monitoring intervals and contract info
const monitoringIntervals = new Map();
const deployedContracts = new Map();

// Initialize provider using config
const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL);

// Function to poll for events - enhanced to support multiple event types
async function pollForEvents(contractAddress, abi, contractName, fromBlock = 'latest') {
  try {
    if (!TELEGRAM_CONFIG.ENABLE_NOTIFICATIONS) {
      return; // Skip if notifications are disabled
    }

    const contract = new ethers.Contract(contractAddress, abi, provider);
    const currentBlock = await provider.getBlockNumber();
    
    // Get the last processed block for this contract, or start from current
    const lastProcessedKey = `lastBlock_${contractAddress}`;
    let lastProcessedBlock = parseInt(process.env[lastProcessedKey] || currentBlock - 10); // Check last 10 blocks
    
    if (lastProcessedBlock >= currentBlock) {
      return; // No new blocks to check
    }
    
    if (TELEGRAM_CONFIG.DEBUG_MODE) {
      console.log(`🔍 [Monitor] Checking blocks ${lastProcessedBlock + 1} to ${currentBlock} for ${contractName}`);
    }
    
    // Check for all monitored event types
    let allEventsFound = [];
    
    for (const eventName of TELEGRAM_CONFIG.MONITORED_EVENTS) {
      try {
        // Check if the contract has this event
        const eventFragment = contract.interface.fragments.find(f => 
          f.type === 'event' && f.name === eventName
        );
        
        if (eventFragment) {
          const filter = contract.filters[eventName]();
          const events = await contract.queryFilter(filter, lastProcessedBlock + 1, currentBlock);
          
          for (const event of events) {
            allEventsFound.push({
              eventName,
              event,
              args: event.args
            });
          }
        }
      } catch (filterError) {
        // Event doesn't exist in this contract, continue
        if (TELEGRAM_CONFIG.DEBUG_MODE) {
          console.log(`📝 [Monitor] Event ${eventName} not found in ${contractName}`);
        }
      }
    }
    
    if (allEventsFound.length > 0) {
      console.log(`📨 [Monitor] Found ${allEventsFound.length} telegram events from ${contractName}`);
      
      for (const { eventName, event, args } of allEventsFound) {
        let message, user;
        
        // Handle different event argument structures
        if (args.message && args.user) {
          message = args.message;
          user = args.user;
        } else if (args.msg && args.sender) {
          message = args.msg;
          user = args.sender;
        } else if (args.text && args.from) {
          message = args.text;
          user = args.from;
        } else if (args.length >= 2) {
          message = args[0];
          user = args[1];
        } else {
          message = `Event ${eventName} triggered`;
          user = event.address;
        }
        
        console.log(`📨 ${eventName} event from ${contractName}:`, { message, user, block: event.blockNumber });
        
        // Send Telegram notification
        try {
          await sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID,
            `📨 Contract Event Detected!\n` +
            `📍 Event: ${eventName}\n` +
            `📍 Contract: ${contractName}\n` +
            `🔗 Address: ${contractAddress.slice(0, 10)}...\n` +
            `👤 User: ${user.toString().slice(0, 10)}...\n` +
            `📝 Message: ${message}\n` +
            `🧱 Block: ${event.blockNumber}\n` +
            `🔢 Transaction: ${event.transactionHash.slice(0, 10)}...\n` +
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
    
    // Start polling using configured interval
    const interval = setInterval(() => {
      pollForEvents(contractAddress, abi, contractName);
    }, TELEGRAM_CONFIG.MONITOR_INTERVAL);
    
    // Store contract info and interval
    deployedContracts.set(contractAddress, {
      abi,
      name: contractName,
      deployedAt: new Date()
    });
    
    monitoringIntervals.set(contractAddress, interval);
    
    console.log(`✅ [Monitor] Polling set up for ${contractName} at ${contractAddress} (interval: ${TELEGRAM_CONFIG.MONITOR_INTERVAL}ms)`);
    
  } catch (error) {
    console.error(`❌ [Monitor] Failed to set up polling for ${contractAddress}:`, error);
  }
}

// Function to stop monitoring for a specific contract
function stopEventMonitoring(contractAddress) {
  const interval = monitoringIntervals.get(contractAddress);
  if (interval) {
    clearInterval(interval);
    monitoringIntervals.delete(contractAddress);
    deployedContracts.delete(contractAddress);
    console.log(`🛑 [Monitor] Stopped monitoring for ${contractAddress}`);
    return true;
  }
  return false;
}

// Function to get monitoring status
function getMonitoringStatus() {
  const contracts = Array.from(deployedContracts.entries()).map(([address, info]) => ({
    address,
    name: info.name,
    deployedAt: info.deployedAt,
    isMonitoring: monitoringIntervals.has(address)
  }));
  
  return {
    totalContracts: contracts.length,
    activeMonitoring: monitoringIntervals.size,
    telegramEnabled: TELEGRAM_CONFIG.ENABLE_NOTIFICATIONS,
    monitorInterval: TELEGRAM_CONFIG.MONITOR_INTERVAL,
    contracts
  };
}

module.exports = {
  pollForEvents,
  setupEventMonitoring,
  stopEventMonitoring,
  getMonitoringStatus
};