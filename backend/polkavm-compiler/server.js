const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Flowchart = require('./models/FlowChart');
const { connectDB, clearDatabase } = require('./database');
const ethers = require('ethers');
const { sendTelegramMessage } = require('../polkaflow-telegram-bot');
const { compile } = require('@parity/resolc'); // Changed import
const { pollForEvents, setupEventMonitoring } = require('./utils');
const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
connectDB();
// Configure Polkadot AssetHub connection
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const PRIVATE_KEY = "fd764dc29df5a5350345a449ba730e9bd17f39012bb0148304081606fcee2811";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const CHAT_ID = "255522477";

// Store deployed contracts for event monitoring
const deployedContracts = new Map();
const monitoringIntervals = new Map();


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

app.post('/api/compile-rust', async (req, res) => {
  const { code } = req.body;
  console.log('Received /api/compile-rust request');

  const filePath = path.join(__dirname, 'temp_contract.rs');
  const outputPath = path.join(__dirname, 'temp_contract.polkavm');

  try {
    // Write the Rust code to a temporary file
    await fs.writeFile(filePath, code);

    // Compile the Rust code to a PolkaVM binary
    const compileCommand = `rustc +nightly --target=riscv32imc-unknown-none-elf -O --crate-type=cdylib -o ${outputPath} ${filePath}`;
    
    await new Promise((resolve, reject) => {
      exec(compileCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Rust compilation error: ${stderr}`);
          reject(new Error(`Rust compilation failed: ${stderr}`));
          return;
        }
        resolve(stdout);
      });
    });

    // Read the compiled binary
    const bytecode = await fs.readFile(outputPath, 'hex');

    // Placeholder for ABI extraction from Rust code
    const abi = []; // TODO: Implement ABI extraction for Rust

    res.json({ success: true, bytecode: `0x${bytecode}`, abi });

  } catch (err) {
    console.error('Rust compilation error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      _debug: err.stack
    });
  } finally {
    // Clean up temporary files
    try {
      await fs.unlink(filePath);
      await fs.unlink(outputPath);
    } catch (cleanupErr) {
      console.error('Error cleaning up temporary files:', cleanupErr);
    }
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

app.post('/api/clear', async (req, res) => {
  try {
    await Flowchart.deleteMany({});
    res.json({ success: true, message: 'All flowcharts deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get('/api/save', async (req, res) => {
  const { walletId, projectId } = req.query;

  if (!walletId || !projectId) {
    return res.status(400).json({ success: false, error: 'walletId and projectId are required.' });
  }

  try {
    const flow = await Flowchart.findOne({ walletId, projectId });
    if (!flow) {
      return res.status(404).json({ success: false, error: 'Flowchart not found.' });
    }
    // Sort versions by timestamp ascending
    const sortedVersions = flow.versions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.json({ success: true, versions: sortedVersions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/save', async (req, res) => {
  const { walletId, projectId, flowData } = req.body;
  console.log('got some shit');
  if (!walletId || !projectId || !flowData) {
    return res.status(400).json({ success: false, error: 'walletId, projectId, and flowData are required.' });
  }

  try {
    let flowchart = await Flowchart.findOne({ walletId, projectId });

    if (flowchart) {
      flowchart.versions.push({ flowData, timestamp: new Date() });
      await flowchart.save();
    } else {
      // Create new document
      flowchart = new Flowchart({
        walletId,
        projectId,
        versions: [{ flowData, timestamp: new Date() }],
        createdAt: new Date()
      });
      await flowchart.save();
    }

    res.json({ success: true, message: 'Flowchart saved with version control.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/clear', async (req, res) => {
  try {
    await Flowchart.deleteMany({});
    res.json({ success: true, message: 'All flowcharts deleted.' });
  } catch (err) {
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
