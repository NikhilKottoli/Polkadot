const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const ethers = require('ethers');
const { sendTelegramMessage } = require('../polkaflow-telegram-bot');
const { compile } = require('@parity/resolc'); // Changed import

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure Polkadot AssetHub connection
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const PRIVATE_KEY = "fd764dc29df5a5350345a449ba730e9bd17f39012bb0148304081606fcee2811";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const CHAT_ID = "255522477";

// Store deployed contracts for event monitoring
const deployedContracts = new Map();
const monitoringIntervals = new Map();

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
          await sendTelegramMessage(CHAT_ID,
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

app.post('/api/compile', async (req, res) => {
  const { code, contractName } = req.body;
  console.log(`Received /api/compile request for: ${contractName || 'Unknown Contract'}`);
  
  try {
    const sources = {
      'Contract.sol': {
        content: code
      }
    };

    console.log('Compiling with @parity/resolc...');
    const compilationResult = await compile(sources);
    
    // 1. Handle multiple contracts and verify structure
    const contracts = compilationResult.contracts['Contract.sol'];
    if (!contracts || Object.keys(contracts).length === 0) {
      throw new Error('No contracts found in compilation result');
    }

    // 2. Get first contract's details with validation
    const contractName = Object.keys(contracts)[0];
    const contractData = contracts[contractName];
    
    // 3. Ensure proper bytecode format
    const bytecode = contractData.evm?.bytecode?.object;
    console.log('Bytecode:', bytecode);

    // 4. Validate ABI structure
    const abi = contractData.abi;
    if (!Array.isArray(abi) || abi.length === 0) {
      throw new Error('Invalid ABI structure');
    }

    console.log('Compilation successful');

    // Send Telegram notification
    sendTelegramMessage(CHAT_ID,
      `✅ Compilation Successful!\n` +
      `📍 Contract: ${contractName || 'Unknown'}\n` +
      `📦 Bytecode: ${bytecode.slice(0, 12)}...\n` +
      `📄 ABI entries: ${abi.length}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch(error => {
      console.error('❌ Failed to send compilation notification:', error);
    });


    res.json({ success: true, bytecode, abi });

  } catch (err) {
    console.error('Compilation error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      // Add debug info for frontend
      _debug: err.stack 
    });
  }
});

app.post('/api/deploy', async (req, res) => {
  const { bytecode, abi, contractName } = req.body;

  try {
    console.log(`Deploying contract: ${contractName || 'Unknown'}...`);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    console.log('Deployment successful');

    const contractAddress = contract.target;
    const transactionHash = contract.deploymentTransaction().hash;

    // Set up comprehensive event monitoring
    setupEventMonitoring(contractAddress, abi, contractName || 'Unknown');

    // Send Telegram notification for deployment
    sendTelegramMessage(CHAT_ID,
      `✅ Deployment Successful!\n` +
      `📍 Contract: ${contractName || 'Unknown'}\n` +
      `🔗 Address: ${contractAddress}\n` +
      `💰 Transaction Hash: ${transactionHash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch(error => {
      console.error('❌ Failed to send deployment notification:', error);
    });

    res.json({
      success: true,
      contractAddress: contractAddress,
      transactionHash: transactionHash
    });
  } catch (err) {
    console.error('Deployment failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// New endpoint for sending Telegram messages from frontend
app.post('/api/telegram/send', async (req, res) => {
  try {
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'chatId and message are required' 
      });
    }
    
    console.log(`📨 Sending Telegram message to chat ${chatId}:`, message);
    
    const result = await sendTelegramMessage(chatId, message);
    
    console.log('✅ Telegram message sent successfully:', result);
    
    res.json({ 
      success: true, 
      messageId: result.messageId 
    });
    
  } catch (error) {
    console.error('❌ Failed to send Telegram message:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint to register existing contracts for monitoring
app.post('/api/monitor/register', async (req, res) => {
  try {
    const { contractAddress, abi, contractName } = req.body;
    
    if (!contractAddress || !abi) {
      return res.status(400).json({ 
        success: false, 
        error: 'contractAddress and abi are required' 
      });
    }
    
    console.log(`📡 Registering contract for monitoring: ${contractName || contractAddress}`);
    
    setupEventMonitoring(contractAddress, abi, contractName || 'Registered Contract');
    
    res.json({ 
      success: true, 
      message: `Contract ${contractName || contractAddress} registered for monitoring` 
    });
    
  } catch (error) {
    console.error('❌ Failed to register contract for monitoring:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint to get monitoring status
app.get('/api/monitor/status', (req, res) => {
  const contracts = Array.from(deployedContracts.entries()).map(([address, info]) => ({
    address,
    name: info.name,
    deployedAt: info.deployedAt,
    isMonitoring: monitoringIntervals.has(address)
  }));
  
  res.json({
    success: true,
    monitoredContracts: contracts,
    totalContracts: contracts.length
  });
});

// Endpoint to manually check for events (useful for testing)
app.post('/api/monitor/check', async (req, res) => {
  try {
    const { contractAddress } = req.body;
    
    if (contractAddress) {
      // Check specific contract
      const contractInfo = deployedContracts.get(contractAddress);
      if (contractInfo) {
        await pollForEvents(contractAddress, contractInfo.abi, contractInfo.name);
        res.json({ success: true, message: `Checked events for ${contractInfo.name}` });
      } else {
        res.status(404).json({ success: false, error: 'Contract not found in monitoring' });
      }
    } else {
      // Check all monitored contracts
      let checkedCount = 0;
      for (const [address, info] of deployedContracts.entries()) {
        await pollForEvents(address, info.abi, info.name);
        checkedCount++;
      }
      res.json({ success: true, message: `Checked events for ${checkedCount} contracts` });
    }
  } catch (error) {
    console.error('❌ [Monitor] Manual check failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cleanup function for graceful shutdown
function cleanup() {
  console.log('🧹 [Monitor] Cleaning up monitoring intervals...');
  for (const [address, interval] of monitoringIntervals.entries()) {
    clearInterval(interval);
    console.log(`🧹 [Monitor] Cleared interval for ${address}`);
  }
  monitoringIntervals.clear();
}

// Handle graceful shutdown
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📡 Event monitoring system initialized');
});
