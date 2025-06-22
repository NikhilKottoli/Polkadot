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

const ASSET_HUB_ABI = [
  "function createAsset(string name, string symbol, uint8 decimals) external returns (uint256)",
  "function mintAsset(uint256 assetId, address to, uint256 amount) external",
  "function freezeAccount(uint256 assetId, address account) external",
  "function unfreezeAccount(uint256 assetId, address account) external",
  "function getBalance(uint256 assetId, address account) external view returns (uint256)",
  "function isAccountFrozen(uint256 assetId, address account) external view returns (bool)",
  "function getAsset(uint256 assetId) external view returns (tuple(string name, string symbol, uint8 decimals, uint256 totalSupply, address creator, bool exists))",
  "function nextAssetId() external view returns (uint256)",
  "function getUserAssets(address user) external view returns (uint256[])",
];

const app = express();
app.use(cors());
app.use(bodyParser.json());
connectDB();
// Configure Polkadot AssetHub connection
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const PRIVATE_KEY = "";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const CHAT_ID = "255522477";

// XCM Configuration - UPDATE THESE PORTS TO MATCH YOUR ACTUAL SETUP
const XCM_CONFIG = {
  RELAY_CHAIN_WS: 'ws://127.0.0.1:9944',
  PARACHAIN_1000_WS: 'ws://127.0.0.1:9946',
  PARACHAIN_1001_WS: 'ws://127.0.0.1:9947',
  HRMP_PARAMS: {
    maxCapacity: 8,        // Max 8 messages in queue
    maxMessageSize: 1024   // Max 1024 bytes per message
  }
};

// XCM API connections
let xcmConnections = {
  relayApi: null,
  para1000Api: null,
  para1001Api: null
};

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
    // sendTelegramMessage(CHAT_ID,
    //   `✅ Compilation Successful!\n` +
    //   `📍 Contract: ${contractName || 'Unknown'}\n` +
    //   `📦 Bytecode: ${bytecode.slice(0, 12)}...\n` +
    //   `📄 ABI entries: ${abi.length}\n` +
    //   `🕒 Time: ${new Date().toLocaleString()}`
    // ).catch(error => {
    //   console.error('❌ Failed to send compilation notification:', error);
    // });


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

    console.log(
      `📡 Registering contract for monitoring: ${contractName || contractAddress
      }`
    );
    console.log(`📡 Registering contract for monitoring: ${contractName || contractAddress}`);

    setupEventMonitoring(contractAddress, abi, contractName || 'Registered Contract');

    res.json({
      success: true,
      message: `Contract ${contractName || contractAddress
        } registered for monitoring`,
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
// Create Asset
app.post('/api/createAsset', async (req, res) => {
  const { name, symbol, decimals, contractAddress } = req.body;

  try {
    console.log(`Creating asset: ${name} (${symbol})...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const tx = await contract.createAsset(name, symbol, decimals);
    await tx.wait();

    console.log('Asset creation successful');

    // Send Telegram notification
    sendTelegramMessage(CHAT_ID,
      `✅ Asset Created!\n` +
      `📍 Name: ${name}\n` +
      `🔗 Symbol: ${symbol}\n` +
      `👤 For User: ${userAddress}\n` +
      `🆔 Asset ID: ${assetId}\n` +
      `💰 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch((error) => {
      console.error("❌ Failed to send asset creation notification:", error);
      return sendTelegramMessage(CHAT_ID,
        `📍 Name: ${name}\n` +
        `🔗 Symbol: ${symbol}\n` +
        `💰 Transaction Hash: ${tx.hash}\n` +
        `🕒 Time: ${new Date().toLocaleString()}`
      );
    }).catch(error => {
      console.error('❌ Failed to send asset creation notification:', error);
    });


    res.json({
      success: true,
      transactionHash: tx.hash,
      name: name,
      symbol: symbol
    });
  } catch (err) {
    console.error('Asset creation failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mint Asset
app.post('/api/mintAsset', async (req, res) => {
  const { assetId, to, amount, contractAddress } = req.body;

  try {
    console.log(`Minting ${amount} tokens of asset ${assetId} to ${to}...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const tx = await contract.mintAsset(assetId, to, amount);
    await tx.wait();

    console.log('Minting successful');

    sendTelegramMessage(CHAT_ID,
      `✅ Tokens Minted!\n` +
      `📍 Asset ID: ${assetId}\n` +
      `👤 To: ${to}\n` +
      `💰 Amount: ${amount}\n` +
      `👤 By Owner: ${userAddress}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch((error) => {
      console.error("❌ Failed to send minting notification:", error);
      `📍 Asset ID: ${assetId}\n` +
      `👤 To: ${to}\n` +
      `💰 Amount: ${amount}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    }).catch(error => {
      console.error('❌ Failed to send minting notification:', error);
    });

    res.json({
      success: true,
      transactionHash: tx.hash,
      assetId: assetId,
      amount: amount
    });
  } catch (err) {
    console.error('Minting failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Freeze Account
app.post('/api/freezeAccount', async (req, res) => {
  const { assetId, account, contractAddress } = req.body;

  try {
    console.log(`Freezing account ${account} for asset ${assetId}...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const tx = await contract.freezeAccount(assetId, account);
    await tx.wait();

    console.log('Account freezing successful');

    sendTelegramMessage(CHAT_ID,
      `❄️ Account Frozen!\n` +
      `📍 Asset ID: ${assetId}\n` +
      `👤 Account: ${account}\n` +
      `👤 By Owner: ${userAddress}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch((error) => {
      console.error("❌ Failed to send freeze notification:", error);
      `📍 Asset ID: ${assetId}\n` +
      `👤 Account: ${account}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    }).catch(error => {
      console.error('❌ Failed to send freeze notification:', error);
    });

    res.json({
      success: true,
      transactionHash: tx.hash,
      assetId: assetId,
      account: account
    });
  } catch (err) {
    console.error('Account freezing failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unfreeze Account
app.post('/api/unfreezeAccount', async (req, res) => {
  const { assetId, account, contractAddress } = req.body;

  try {
    console.log(`Unfreezing account ${account} for asset ${assetId}...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const tx = await contract.unfreezeAccount(assetId, account);
    await tx.wait();

    console.log('Account unfreezing successful');

    sendTelegramMessage(CHAT_ID,
      `🔥 Account Unfrozen!\n` +
      `📍 Asset ID: ${assetId}\n` +
      `👤 Account: ${account}\n` +
      `👤 By Owner: ${userAddress}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch((error) => {
      console.error("❌ Failed to send unfreeze notification:", error);
      `📍 Asset ID: ${assetId}\n` +
      `👤 Account: ${account}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    }).catch(error => {
      console.error('❌ Failed to send unfreeze notification:', error);
    });

    res.json({
      success: true,
      transactionHash: tx.hash,
      assetId: assetId,
      account: account
    });
  } catch (err) {
    console.error('Account unfreezing failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Asset Info
app.get('/api/getAsset/:contractAddress/:assetId', async (req, res) => {
  const { contractAddress, assetId } = req.params;

  try {
    console.log(`Fetching asset info for asset ${assetId}...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const assetInfo = await contract.getAsset(assetId);

    res.json({
      success: true,
      asset: {
        name: assetInfo[0],
        symbol: assetInfo[1],
        decimals: Number(assetInfo[2]),
        totalSupply: assetInfo[3].toString(),
        creator: assetInfo[4],
        exists: assetInfo[5]
      }
    });
  } catch (err) {
    console.error('Failed to fetch asset info:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Balance
app.get('/api/getBalance/:contractAddress/:assetId/:account', async (req, res) => {
  const { contractAddress, assetId, account } = req.params;

  try {
    console.log(`Fetching balance for account ${account} in asset ${assetId}...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const balance = await contract.getBalance(assetId, account);

    res.json({
      success: true,
      balance: balance.toString()
    });
  } catch (err) {
    console.error('Failed to fetch balance:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Check if Account is Frozen
app.get('/api/isAccountFrozen/:contractAddress/:assetId/:account', async (req, res) => {
  const { contractAddress, assetId, account } = req.params;

  try {
    console.log(`Checking freeze status for account ${account} in asset ${assetId}...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const isFrozen = await contract.isAccountFrozen(assetId, account);

    res.json({
      success: true,
      isFrozen: isFrozen
    });
  } catch (err) {
    console.error('Failed to check freeze status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Assets
app.get('/api/getUserAssets/:contractAddress/:userAddress', async (req, res) => {
  const { contractAddress, userAddress } = req.params;

  try {
    console.log(`Fetching assets for user ${userAddress}...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const userAssets = await contract.getUserAssets(userAddress);

    res.json({
      success: true,
      assets: userAssets.map(id => Number(id))
    });
  } catch (err) {
    console.error('Failed to fetch user assets:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Next Asset ID
app.get('/api/getNextAssetId/:contractAddress', async (req, res) => {
  const { contractAddress } = req.params;

  try {
    console.log(`Fetching next asset ID...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const nextAssetId = await contract.nextAssetId();

    res.json({
      success: true,
      nextAssetId: Number(nextAssetId)
    });
  } catch (err) {
    console.error('Failed to fetch next asset ID:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
// Get All Assets (since all are created by backend wallet)
app.get('/api/getAllAssets/:contractAddress', async (req, res) => {
  const { contractAddress } = req.params;

  try {
    console.log(`Fetching all assets...`);
    
    const contract = new ethers.Contract(contractAddress, ASSET_HUB_ABI, wallet);
    const nextAssetId = await contract.nextAssetId();
    
    // Create array of all asset IDs from 0 to nextAssetId-1
    const allAssets = [];
    for (let i = 0; i < Number(nextAssetId); i++) {
      allAssets.push(i);
    }

    res.json({
      success: true,
      assets: allAssets
    });
  } catch (err) {
    console.error('Failed to fetch all assets:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Handle graceful shutdown
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📡 Event monitoring system initialized');
});
