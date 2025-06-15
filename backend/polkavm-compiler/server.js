const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Flowchart = require('./models/FlowChart');
const { connectDB, clearDatabase } = require('./database');
const ethers = require('ethers');
const { sendTelegramMessage } = require('../polkaflow-telegram-bot');
const { compile } = require('@parity/resolc'); // Changed import
const { pollForEvents, setupEventMonitoring, stopEventMonitoring, getMonitoringStatus } = require('./utils');
const { TELEGRAM_CONFIG, BLOCKCHAIN_CONFIG } = require('./telegram-config');
const fs = require('fs');
const path = require('path');
const { handleRustCode } = require("./controllers/rustHandler");

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
const PRIVATE_KEY =
  "fd764dc29df5a5350345a449ba730e9bd17f39012bb0148304081606fcee2811";
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

// User asset tracking with file persistence
const USER_ASSETS_FILE = path.join(__dirname, "userAssets.json");
let userAssetMapping = new Map();

// Load existing user assets on startup
if (fs.existsSync(USER_ASSETS_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(USER_ASSETS_FILE, "utf8"));
    userAssetMapping = new Map(Object.entries(data).map(([k, v]) => [k, v]));
    console.log("📁 Loaded user asset mappings from file");
  } catch (error) {
    console.error("❌ Failed to load user assets file:", error);
  }
}

// Save user assets to file
const saveUserAssets = () => {
  try {
    const data = Object.fromEntries(userAssetMapping);
    fs.writeFileSync(USER_ASSETS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Failed to save user assets:", error);
  }
};

// Helper function to check if user owns asset
const checkAssetOwnership = (userAddress, assetId) => {
  const userAssets = userAssetMapping.get(userAddress) || [];
  return userAssets.includes(parseInt(assetId));
};

// === XCM FUNCTIONALITY ===

// Initialize XCM connections
async function initXcmConnections() {
  try {
    await cryptoWaitReady();

    if (!xcmConnections.relayApi) {
      const relayProvider = new WsProvider(XCM_CONFIG.RELAY_CHAIN_WS);
      xcmConnections.relayApi = await ApiPromise.create({ provider: relayProvider });
      console.log('✅ Relay chain connected');
    }

    if (!xcmConnections.para1000Api) {
      const para1000Provider = new WsProvider(XCM_CONFIG.PARACHAIN_1000_WS);
      xcmConnections.para1000Api = await ApiPromise.create({ provider: para1000Provider });
      console.log('✅ Parachain 1000 connected');
    }

    if (!xcmConnections.para1001Api) {
      const para1001Provider = new WsProvider(XCM_CONFIG.PARACHAIN_1001_WS);
      xcmConnections.para1001Api = await ApiPromise.create({ provider: para1001Provider });
      console.log('✅ Parachain 1001 connected');
    }

    console.log('✅ All XCM connections initialized');
    return true;
  } catch (error) {
    console.error('❌ XCM connection failed:', error.message);
    return false;
  }
}

// 1. Initialize XCM connections and check status
app.post('/api/xcm/init', async (req, res) => {
  try {
    const success = await initXcmConnections();

    const connectionStatus = {
      relayChain: !!xcmConnections.relayApi,
      parachain1000: !!xcmConnections.para1000Api,
      parachain1001: !!xcmConnections.para1001Api
    };

    res.json({
      success,
      message: success ? 'XCM connections initialized successfully' : 'Some connections failed',
      connections: connectionStatus,
      endpoints: XCM_CONFIG
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Open HRMP Channels (Bidirectional) - Exact implementation as requested
app.post('/api/xcm/hrmp/open-bidirectional', async (req, res) => {
  const { sudoSeed = '//Alice' } = req.body;

  try {
    if (!xcmConnections.relayApi) {
      return res.status(400).json({ success: false, error: 'Relay chain not connected. Call /api/xcm/init first.' });
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const sudoKey = keyring.addFromUri(sudoSeed);

    console.log('🔗 Opening HRMP channels bidirectionally...');

    // From Parachain 1000 → 1001
    const tx1000to1001 = xcmConnections.relayApi.tx.hrmp.hrmpInitOpenChannel(1001, 8, 1024);
    const hash1000to1001 = await tx1000to1001.signAndSend(sudoKey);
    console.log(`✅ Channel 1000→1001 opened: ${hash1000to1001}`);

    // From Parachain 1001 → 1000  
    const tx1001to1000 = xcmConnections.relayApi.tx.hrmp.hrmpInitOpenChannel(1000, 8, 1024);
    const hash1001to1000 = await tx1001to1000.signAndSend(sudoKey);
    console.log(`✅ Channel 1001→1000 opened: ${hash1001to1000}`);

    // Accept channels on both sides
    const acceptTx1000 = xcmConnections.relayApi.tx.hrmp.hrmpAcceptOpenChannel(1000);
    const acceptHash1000 = await acceptTx1000.signAndSend(sudoKey);
    console.log(`✅ Channel from 1000 accepted: ${acceptHash1000}`);

    const acceptTx1001 = xcmConnections.relayApi.tx.hrmp.hrmpAcceptOpenChannel(1001);
    const acceptHash1001 = await acceptTx1001.signAndSend(sudoKey);
    console.log(`✅ Channel from 1001 accepted: ${acceptHash1001}`);

    sendTelegramMessage(CHAT_ID,
      `🔄 Bidirectional HRMP Channels Opened!\n` +
      `📍 Parachain 1000 ↔ Parachain 1001\n` +
      `🔗 Open: ${hash1000to1001.toString().substring(0, 10)}..., ${hash1001to1000.toString().substring(0, 10)}...\n` +
      `✅ Accept: ${acceptHash1000.toString().substring(0, 10)}..., ${acceptHash1001.toString().substring(0, 10)}...\n` +
      `📊 Capacity: 8, Max Size: 1024\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch(console.error);

    res.json({
      success: true,
      message: 'Bidirectional HRMP channels opened successfully',
      channels: {
        '1000to1001': {
          open: hash1000to1001.toString(),
          accept: acceptHash1001.toString()
        },
        '1001to1000': {
          open: hash1001to1000.toString(),
          accept: acceptHash1000.toString()
        }
      },
      parameters: { maxCapacity: 8, maxMessageSize: 1024 }
    });
  } catch (error) {
    console.error('HRMP channel setup failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. XCM Transfer (Para 1000 → Para 1001) - Exact implementation as requested
app.post('/api/xcm/transfer', async (req, res) => {
  const {
    fromPara,
    toPara,
    amount,
    accountSeed = '//Alice',
    asset = 'UNIT'
  } = req.body;

  try {
    const fromApi = fromPara === 1000 ? xcmConnections.para1000Api : xcmConnections.para1001Api;

    if (!fromApi) {
      return res.status(400).json({
        success: false,
        error: `Parachain ${fromPara} not connected. Call /api/xcm/init first.`
      });
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri(accountSeed);

    console.log(`🚀 Initiating XCM transfer from Para ${fromPara} to Para ${toPara}...`);

    // Exact implementation as requested
    const tx = fromApi.tx.xTokens.transfer(
      { Token: asset },  // Native token of your parachain
      amount,           // Amount in smallest unit (12 decimals)
      {
        V3: {
          parents: 1,
          interior: { X1: { Parachain: toPara } }
        }
      },
      "Unlimited"
    );

    const hash = await tx.signAndSend(alice);
    console.log(`✅ XCM transfer submitted: ${hash}`);

    sendTelegramMessage(CHAT_ID,
      `🚀 XCM Transfer Executed!\n` +
      `📍 From: Parachain ${fromPara}\n` +
      `📍 To: Parachain ${toPara}\n` +
      `💰 Amount: ${amount} ${asset}\n` +
      `👤 Sender: ${alice.address}\n` +
      `🔗 Transaction Hash: ${hash}\n` +
      `📋 XCM Instructions: WithdrawAsset, BuyExecution, DepositAsset\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch(console.error);

    res.json({
      success: true,
      transactionHash: hash.toString(),
      fromPara,
      toPara,
      amount,
      asset,
      sender: alice.address,
      xcmInstructions: ['WithdrawAsset', 'BuyExecution', 'DepositAsset'],
      multiLocation: {
        parents: 1,
        interior: { X1: { Parachain: toPara } }
      }
    });
  } catch (error) {
    console.error('XCM transfer failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Check account balance on destination chain
app.get('/api/xcm/balance/:paraId/:accountAddress', async (req, res) => {
  const { paraId, accountAddress } = req.params;

  try {
    const api = paraId === '1000' ? xcmConnections.para1000Api : xcmConnections.para1001Api;

    if (!api) {
      return res.status(400).json({
        success: false,
        error: `Parachain ${paraId} not connected`
      });
    }

    const account = await api.query.system.account(accountAddress);
    const balance = account.data.free.toString();

    res.json({
      success: true,
      parachain: paraId,
      account: accountAddress,
      balance: balance,
      balanceFormatted: `${(parseInt(balance) / Math.pow(10, 12)).toFixed(4)} UNIT`
    });
  } catch (error) {
    console.error('Balance check failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Get XCM connection status
app.get('/api/xcm/status', (req, res) => {
  const connections = {
    relayChain: !!xcmConnections.relayApi,
    parachain1000: !!xcmConnections.para1000Api,
    parachain1001: !!xcmConnections.para1001Api
  };

  const allConnected = connections.relayChain && connections.parachain1000 && connections.parachain1001;

  res.json({
    success: true,
    allConnected,
    connections,
    config: XCM_CONFIG,
    readyForDemo: allConnected,
    message: allConnected ?
      'All chains connected - Ready for XCM operations!' :
      'Some chains disconnected - Check connections'
  });
});

// === END XCM FUNCTIONALITY ===

// === XCM FUNCTIONALITY ===

// Initialize XCM connections
async function initXcmConnections() {
  try {
    await cryptoWaitReady();

    if (!xcmConnections.relayApi) {
      const relayProvider = new WsProvider(XCM_CONFIG.RELAY_CHAIN_WS);
      xcmConnections.relayApi = await ApiPromise.create({ provider: relayProvider });
      console.log('✅ Relay chain connected');
    }

    if (!xcmConnections.para1000Api) {
      const para1000Provider = new WsProvider(XCM_CONFIG.PARACHAIN_1000_WS);
      xcmConnections.para1000Api = await ApiPromise.create({ provider: para1000Provider });
      console.log('✅ Parachain 1000 connected');
    }

    if (!xcmConnections.para1001Api) {
      const para1001Provider = new WsProvider(XCM_CONFIG.PARACHAIN_1001_WS);
      xcmConnections.para1001Api = await ApiPromise.create({ provider: para1001Provider });
      console.log('✅ Parachain 1001 connected');
    }

    console.log('✅ All XCM connections initialized');
    return true;
  } catch (error) {
    console.error('❌ XCM connection failed:', error.message);
    return false;
  }
}

// 1. Initialize XCM connections and check status
app.post('/api/xcm/init', async (req, res) => {
  try {
    const success = await initXcmConnections();

    const connectionStatus = {
      relayChain: !!xcmConnections.relayApi,
      parachain1000: !!xcmConnections.para1000Api,
      parachain1001: !!xcmConnections.para1001Api
    };

    res.json({
      success,
      message: success ? 'XCM connections initialized successfully' : 'Some connections failed',
      connections: connectionStatus,
      endpoints: XCM_CONFIG
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Open HRMP Channels (Bidirectional) - Exact implementation as requested
app.post('/api/xcm/hrmp/open-bidirectional', async (req, res) => {
  const { sudoSeed = '//Alice' } = req.body;

  try {
    if (!xcmConnections.relayApi) {
      return res.status(400).json({ success: false, error: 'Relay chain not connected. Call /api/xcm/init first.' });
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const sudoKey = keyring.addFromUri(sudoSeed);

    console.log('🔗 Opening HRMP channels bidirectionally...');

    // From Parachain 1000 → 1001
    const tx1000to1001 = xcmConnections.relayApi.tx.hrmp.hrmpInitOpenChannel(1001, 8, 1024);
    const hash1000to1001 = await tx1000to1001.signAndSend(sudoKey);
    console.log(`✅ Channel 1000→1001 opened: ${hash1000to1001}`);

    // From Parachain 1001 → 1000  
    const tx1001to1000 = xcmConnections.relayApi.tx.hrmp.hrmpInitOpenChannel(1000, 8, 1024);
    const hash1001to1000 = await tx1001to1000.signAndSend(sudoKey);
    console.log(`✅ Channel 1001→1000 opened: ${hash1001to1000}`);

    // Accept channels on both sides
    const acceptTx1000 = xcmConnections.relayApi.tx.hrmp.hrmpAcceptOpenChannel(1000);
    const acceptHash1000 = await acceptTx1000.signAndSend(sudoKey);
    console.log(`✅ Channel from 1000 accepted: ${acceptHash1000}`);

    const acceptTx1001 = xcmConnections.relayApi.tx.hrmp.hrmpAcceptOpenChannel(1001);
    const acceptHash1001 = await acceptTx1001.signAndSend(sudoKey);
    console.log(`✅ Channel from 1001 accepted: ${acceptHash1001}`);

    sendTelegramMessage(CHAT_ID,
      `🔄 Bidirectional HRMP Channels Opened!\n` +
      `📍 Parachain 1000 ↔ Parachain 1001\n` +
      `🔗 Open: ${hash1000to1001.toString().substring(0, 10)}..., ${hash1001to1000.toString().substring(0, 10)}...\n` +
      `✅ Accept: ${acceptHash1000.toString().substring(0, 10)}..., ${acceptHash1001.toString().substring(0, 10)}...\n` +
      `📊 Capacity: 8, Max Size: 1024\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch(console.error);

    res.json({
      success: true,
      message: 'Bidirectional HRMP channels opened successfully',
      channels: {
        '1000to1001': {
          open: hash1000to1001.toString(),
          accept: acceptHash1001.toString()
        },
        '1001to1000': {
          open: hash1001to1000.toString(),
          accept: acceptHash1000.toString()
        }
      },
      parameters: { maxCapacity: 8, maxMessageSize: 1024 }
    });
  } catch (error) {
    console.error('HRMP channel setup failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. XCM Transfer (Para 1000 → Para 1001) - Exact implementation as requested
app.post('/api/xcm/transfer', async (req, res) => {
  const {
    fromPara,
    toPara,
    amount,
    accountSeed = '//Alice',
    asset = 'UNIT'
  } = req.body;

  try {
    const fromApi = fromPara === 1000 ? xcmConnections.para1000Api : xcmConnections.para1001Api;

    if (!fromApi) {
      return res.status(400).json({
        success: false,
        error: `Parachain ${fromPara} not connected. Call /api/xcm/init first.`
      });
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri(accountSeed);

    console.log(`🚀 Initiating XCM transfer from Para ${fromPara} to Para ${toPara}...`);

    // Exact implementation as requested
    const tx = fromApi.tx.xTokens.transfer(
      { Token: asset },  // Native token of your parachain
      amount,           // Amount in smallest unit (12 decimals)
      {
        V3: {
          parents: 1,
          interior: { X1: { Parachain: toPara } }
        }
      },
      "Unlimited"
    );

    const hash = await tx.signAndSend(alice);
    console.log(`✅ XCM transfer submitted: ${hash}`);

    sendTelegramMessage(CHAT_ID,
      `🚀 XCM Transfer Executed!\n` +
      `📍 From: Parachain ${fromPara}\n` +
      `📍 To: Parachain ${toPara}\n` +
      `💰 Amount: ${amount} ${asset}\n` +
      `👤 Sender: ${alice.address}\n` +
      `🔗 Transaction Hash: ${hash}\n` +
      `📋 XCM Instructions: WithdrawAsset, BuyExecution, DepositAsset\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch(console.error);

    res.json({
      success: true,
      transactionHash: hash.toString(),
      fromPara,
      toPara,
      amount,
      asset,
      sender: alice.address,
      xcmInstructions: ['WithdrawAsset', 'BuyExecution', 'DepositAsset'],
      multiLocation: {
        parents: 1,
        interior: { X1: { Parachain: toPara } }
      }
    });
  } catch (error) {
    console.error('XCM transfer failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Check account balance on destination chain
app.get('/api/xcm/balance/:paraId/:accountAddress', async (req, res) => {
  const { paraId, accountAddress } = req.params;

  try {
    const api = paraId === '1000' ? xcmConnections.para1000Api : xcmConnections.para1001Api;

    if (!api) {
      return res.status(400).json({
        success: false,
        error: `Parachain ${paraId} not connected`
      });
    }

    const account = await api.query.system.account(accountAddress);
    const balance = account.data.free.toString();

    res.json({
      success: true,
      parachain: paraId,
      account: accountAddress,
      balance: balance,
      balanceFormatted: `${(parseInt(balance) / Math.pow(10, 12)).toFixed(4)} UNIT`
    });
  } catch (error) {
    console.error('Balance check failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Get XCM connection status
app.get('/api/xcm/status', (req, res) => {
  const connections = {
    relayChain: !!xcmConnections.relayApi,
    parachain1000: !!xcmConnections.para1000Api,
    parachain1001: !!xcmConnections.para1001Api
  };

  const allConnected = connections.relayChain && connections.parachain1000 && connections.parachain1001;

  res.json({
    success: true,
    allConnected,
    connections,
    config: XCM_CONFIG,
    readyForDemo: allConnected,
    message: allConnected ?
      'All chains connected - Ready for XCM operations!' :
      'Some chains disconnected - Check connections'
  });
});

// === END XCM FUNCTIONALITY ===

app.post('/api/compile', async (req, res) => {
  const { code, contractName } = req.body;
  const finalContractName = contractName || "Unknown Contract";
  console.log(`Received /api/compile request for: ${finalContractName}`);

  // Send Telegram notification for compilation start
  if (TELEGRAM_CONFIG.ENABLE_NOTIFICATIONS) {
    sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID,
      `🔨 Compilation Started!\n` +
      `📍 Contract: ${finalContractName}\n` +
      `📝 Code Length: ${code.length} characters\n` +
      `🕒 Started: ${new Date().toLocaleString()}`
    ).catch(console.error);
  }

  try {
    const sources = {
      "Contract.sol": {
        content: code,
      },
    };

    console.log("Compiling with @parity/resolc...");
    const compilationResult = await compile(sources);

    // 1. Handle multiple contracts and verify structure
    const contracts = compilationResult.contracts["Contract.sol"];
    if (!contracts || Object.keys(contracts).length === 0) {
      throw new Error("No contracts found in compilation result");
    }

    // 2. Get first contract's details with validation
    const compiledContractName = Object.keys(contracts)[0];
    const contractData = contracts[compiledContractName];

    // 3. Ensure proper bytecode format
    const bytecode = contractData.evm?.bytecode?.object;
    console.log("Bytecode:", bytecode);

    // 4. Validate ABI structure
    const abi = contractData.abi;
    if (!Array.isArray(abi) || abi.length === 0) {
      throw new Error("Invalid ABI structure");
    }

    console.log("Compilation successful");

    // Send Telegram notification for successful compilation
    if (TELEGRAM_CONFIG.ENABLE_NOTIFICATIONS) {
      const functionCount = abi.filter(item => item.type === 'function').length;
      const eventCount = abi.filter(item => item.type === 'event').length;
      const telegramEvents = abi.filter(item => 
        item.type === 'event' && 
        TELEGRAM_CONFIG.MONITORED_EVENTS.includes(item.name)
      );
      
      sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID,
        `✅ Compilation Successful!\n` +
        `📍 Contract: ${finalContractName}\n` +
        `📊 Bytecode Size: ${bytecode ? (bytecode.length / 2) : 0} bytes\n` +
        `📋 Functions: ${functionCount}\n` +
        `📋 Events: ${eventCount}\n` +
        `📨 Telegram Events: ${telegramEvents.length}\n` +
        `🔔 Events: ${telegramEvents.map(e => e.name).join(', ') || 'None'}\n` +
        `🕒 Completed: ${new Date().toLocaleString()}`
      ).catch(console.error);
    }

    res.json({ success: true, bytecode, abi });
  } catch (err) {
    console.error("Compilation error:", err.message);
    
    // Send Telegram notification for compilation error
    if (TELEGRAM_CONFIG.ENABLE_NOTIFICATIONS) {
      sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID,
        `❌ Compilation Failed!\n` +
        `📍 Contract: ${finalContractName}\n` +
        `❌ Error: ${err.message.slice(0, 200)}...\n` +
        `🕒 Time: ${new Date().toLocaleString()}`
      ).catch(console.error);
    }
    
    res.status(500).json({
      success: false,
      error: err.message,
      _debug: err.stack,
    });
  }
});

app.post("/api/compile-rust", async (req, res) => {
  const { code } = req.body;
  console.log("Received /api/compile-rust request");

  const filePath = path.join(__dirname, "temp_contract.rs");
  const outputPath = path.join(__dirname, "temp_contract.polkavm");

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
    const bytecode = await fs.readFile(outputPath, "hex");

    // Placeholder for ABI extraction from Rust code
    const abi = []; // TODO: Implement ABI extraction for Rust

    res.json({ success: true, bytecode: `0x${bytecode}`, abi });
  } catch (err) {
    console.error("Rust compilation error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      _debug: err.stack,
    });
  } finally {
    // Clean up temporary files
    try {
      await fs.unlink(filePath);
      await fs.unlink(outputPath);
    } catch (cleanupErr) {
      console.error("Error cleaning up temporary files:", cleanupErr);
    }
  }
});

app.post("/api/deploy", async (req, res) => {
  const { bytecode, abi, contractName } = req.body;

  try {
    console.log(`Deploying contract: ${contractName || "Unknown"}...`);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    console.log("Deployment successful");

    const contractAddress = contract.target;
    const transactionHash = contract.deploymentTransaction().hash;

    // Set up comprehensive event monitoring
    setupEventMonitoring(contractAddress, abi, contractName || "Unknown");

    // Send Telegram notification for deployment
    if (TELEGRAM_CONFIG.ENABLE_NOTIFICATIONS) {
      sendTelegramMessage(
        TELEGRAM_CONFIG.CHAT_ID,
        `✅ Deployment Successful!\n` +
        `📍 Contract: ${contractName || "Unknown"}\n` +
        `🔗 Address: ${contractAddress}\n` +
        `💰 Transaction Hash: ${transactionHash}\n` +
        `📡 Auto-monitoring enabled for telegram events\n` +
        `🔔 Watching for: ${TELEGRAM_CONFIG.MONITORED_EVENTS.join(', ')}\n` +
        `🕒 Time: ${new Date().toLocaleString()}`
      ).catch((error) => {
        console.error("❌ Failed to send deployment notification:", error);
      });
    }

    res.json({
      success: true,
      contractAddress: contractAddress,
      transactionHash: transactionHash,
    });
  } catch (err) {
    console.error("Deployment failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/clear", async (req, res) => {
  try {
    await Flowchart.deleteMany({});
    res.json({ success: true, message: "All flowcharts deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/save", async (req, res) => {
  const { walletId, projectId } = req.query;

  if (!walletId || !projectId) {
    return res
      .status(400)
      .json({ success: false, error: "walletId and projectId are required." });
  }

  try {
    const flow = await Flowchart.findOne({ walletId, projectId });
    if (!flow) {
      return res
        .status(404)
        .json({ success: false, error: "Flowchart not found." });
    }
    const sortedVersions = flow.versions.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    res.json({ success: true, versions: sortedVersions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/save", async (req, res) => {
  const { walletId, projectId, flowData } = req.body;
  console.log("got some shit");
  if (!walletId || !projectId || !flowData) {
    return res.status(400).json({
      success: false,
      error: "walletId, projectId, and flowData are required.",
    });
  }

  try {
    let flowchart = await Flowchart.findOne({ walletId, projectId });

    if (flowchart) {
      flowchart.versions.push({ flowData, timestamp: new Date() });
      await flowchart.save();
    } else {
      flowchart = new Flowchart({
        walletId,
        projectId,
        versions: [{ flowData, timestamp: new Date() }],
        createdAt: new Date(),
      });
      await flowchart.save();
    }

    res.json({
      success: true,
      message: "Flowchart saved with version control.",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/telegram/send", async (req, res) => {
  try {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        error: "chatId and message are required",
      });
    }

    console.log(`📨 Sending Telegram message to chat ${chatId}:`, message);

    const result = await sendTelegramMessage(chatId, message);

    console.log("✅ Telegram message sent successfully:", result);

    res.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("❌ Failed to send Telegram message:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/monitor/register", async (req, res) => {
  try {
    const { contractAddress, abi, contractName } = req.body;

    if (!contractAddress || !abi) {
      return res.status(400).json({
        success: false,
        error: "contractAddress and abi are required",
      });
    }

    console.log(
      `📡 Registering contract for monitoring: ${contractName || contractAddress
      }`
    );

    setupEventMonitoring(
      contractAddress,
      abi,
      contractName || "Registered Contract"
    );

    // Send Telegram notification for new monitoring
    if (TELEGRAM_CONFIG.ENABLE_NOTIFICATIONS) {
      sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID,
        `📡 Contract Monitoring Started!\n` +
        `📍 Contract: ${contractName || "Registered Contract"}\n` +
        `🔗 Address: ${contractAddress.slice(0, 10)}...\n` +
        `🔔 Monitoring Events: ${TELEGRAM_CONFIG.MONITORED_EVENTS.join(', ')}\n` +
        `⏱️ Interval: ${TELEGRAM_CONFIG.MONITOR_INTERVAL}ms\n` +
        `🕒 Started: ${new Date().toLocaleString()}`
      ).catch(console.error);
    }

    res.json({
      success: true,
      message: `Contract ${contractName || contractAddress
        } registered for monitoring`,
    });
  } catch (error) {
    console.error("❌ Failed to register contract for monitoring:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/monitor/status", (req, res) => {
  const contracts = Array.from(deployedContracts.entries()).map(
    ([address, info]) => ({
      address,
      name: info.name,
      deployedAt: info.deployedAt,
      isMonitoring: monitoringIntervals.has(address),
    })
  );

  res.json({
    success: true,
    monitoredContracts: contracts,
    totalContracts: contracts.length,
  });
});

app.post("/api/monitor/check", async (req, res) => {
  try {
    const { contractAddress } = req.body;

    if (contractAddress) {
      const contractInfo = deployedContracts.get(contractAddress);
      if (contractInfo) {
        await pollForEvents(
          contractAddress,
          contractInfo.abi,
          contractInfo.name
        );
        res.json({
          success: true,
          message: `Checked events for ${contractInfo.name}`,
        });
      } else {
        res
          .status(404)
          .json({ success: false, error: "Contract not found in monitoring" });
      }
    } else {
      let checkedCount = 0;
      for (const [address, info] of deployedContracts.entries()) {
        await pollForEvents(address, info.abi, info.name);
        checkedCount++;
      }
      res.json({
        success: true,
        message: `Checked events for ${checkedCount} contracts`,
      });
    }
  } catch (error) {
    console.error("❌ [Monitor] Manual check failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function cleanup() {
  console.log("🧹 [Monitor] Cleaning up monitoring intervals...");
  for (const [address, interval] of monitoringIntervals.entries()) {
    clearInterval(interval);
    console.log(`🧹 [Monitor] Cleared interval for ${address}`);
  }
  monitoringIntervals.clear();
}

// Create Asset - Updated with user tracking
app.post("/api/createAsset", async (req, res) => {
  const { name, symbol, decimals, contractAddress, userAddress } = req.body;

  try {
    console.log(
      `Creating asset: ${name} (${symbol}) for user: ${userAddress}...`
    );

    const contract = new ethers.Contract(
      contractAddress,
      ASSET_HUB_ABI,
      wallet
    );
    const tx = await contract.createAsset(name, symbol, decimals);
    await tx.wait();

    // Get the asset ID that was just created
    const nextId = await contract.nextAssetId();
    const assetId = Number(nextId) - 1;

    // Track which user created this asset
    if (!userAssetMapping.has(userAddress)) {
      userAssetMapping.set(userAddress, []);
    }
    userAssetMapping.get(userAddress).push(assetId);
    saveUserAssets();

    console.log(`Asset ${assetId} created for user ${userAddress}`);

    sendTelegramMessage(
      CHAT_ID,
      `✅ Asset Created!\n` +
      `📍 Name: ${name}\n` +
      `🔗 Symbol: ${symbol}\n` +
      `👤 For User: ${userAddress}\n` +
      `🆔 Asset ID: ${assetId}\n` +
      `💰 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch((error) => {
      console.error("❌ Failed to send asset creation notification:", error);
    });

    res.json({
      success: true,
      transactionHash: tx.hash,
      assetId: assetId,
      name: name,
      symbol: symbol,
    });
  } catch (err) {
    console.error("Asset creation failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mint Asset - Updated with ownership check
app.post("/api/mintAsset", async (req, res) => {
  const { assetId, to, amount, contractAddress, userAddress } = req.body;

  try {
    // Check if user owns this asset
    if (!checkAssetOwnership(userAddress, assetId)) {
      return res.status(403).json({
        success: false,
        error: "You don't own this asset",
      });
    }

    console.log(
      `Minting ${amount} tokens of asset ${assetId} to ${to} for owner ${userAddress}...`
    );

    const contract = new ethers.Contract(
      contractAddress,
      ASSET_HUB_ABI,
      wallet
    );
    const tx = await contract.mintAsset(assetId, to, amount);
    await tx.wait();

    console.log("Minting successful");

    sendTelegramMessage(
      CHAT_ID,
      `✅ Tokens Minted!\n` +
      `📍 Asset ID: ${assetId}\n` +
      `👤 To: ${to}\n` +
      `💰 Amount: ${amount}\n` +
      `👤 By Owner: ${userAddress}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch((error) => {
      console.error("❌ Failed to send minting notification:", error);
    });

    res.json({
      success: true,
      transactionHash: tx.hash,
      assetId: assetId,
      amount: amount,
    });
  } catch (err) {
    console.error("Minting failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Freeze Account - Updated with ownership check
app.post("/api/freezeAccount", async (req, res) => {
  const { assetId, account, contractAddress, userAddress } = req.body;

  try {
    // Check if user owns this asset
    if (!checkAssetOwnership(userAddress, assetId)) {
      return res.status(403).json({
        success: false,
        error: "You don't own this asset",
      });
    }

    console.log(
      `Freezing account ${account} for asset ${assetId} by owner ${userAddress}...`
    );

    const contract = new ethers.Contract(
      contractAddress,
      ASSET_HUB_ABI,
      wallet
    );
    const tx = await contract.freezeAccount(assetId, account);
    await tx.wait();

    console.log("Account freezing successful");

    sendTelegramMessage(
      CHAT_ID,
      `❄️ Account Frozen!\n` +
      `📍 Asset ID: ${assetId}\n` +
      `👤 Account: ${account}\n` +
      `👤 By Owner: ${userAddress}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch((error) => {
      console.error("❌ Failed to send freeze notification:", error);
    });

    res.json({
      success: true,
      transactionHash: tx.hash,
      assetId: assetId,
      account: account,
    });
  } catch (err) {
    console.error("Account freezing failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unfreeze Account - Updated with ownership check
app.post("/api/unfreezeAccount", async (req, res) => {
  const { assetId, account, contractAddress, userAddress } = req.body;

  try {
    // Check if user owns this asset
    if (!checkAssetOwnership(userAddress, assetId)) {
      return res.status(403).json({
        success: false,
        error: "You don't own this asset",
      });
    }

    console.log(
      `Unfreezing account ${account} for asset ${assetId} by owner ${userAddress}...`
    );

    const contract = new ethers.Contract(
      contractAddress,
      ASSET_HUB_ABI,
      wallet
    );
    const tx = await contract.unfreezeAccount(assetId, account);
    await tx.wait();

    console.log("Account unfreezing successful");

    sendTelegramMessage(
      CHAT_ID,
      `🔥 Account Unfrozen!\n` +
      `📍 Asset ID: ${assetId}\n` +
      `👤 Account: ${account}\n` +
      `👤 By Owner: ${userAddress}\n` +
      `🔗 Transaction Hash: ${tx.hash}\n` +
      `🕒 Time: ${new Date().toLocaleString()}`
    ).catch((error) => {
      console.error("❌ Failed to send unfreeze notification:", error);
    });

    res.json({
      success: true,
      transactionHash: tx.hash,
      assetId: assetId,
      account: account,
    });
  } catch (err) {
    console.error("Account unfreezing failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User's Owned Assets - New endpoint
app.get("/api/getUserOwnedAssets/:userAddress", async (req, res) => {
  const { userAddress } = req.params;

  try {
    const userAssets = userAssetMapping.get(userAddress) || [];
    console.log(`User ${userAddress} owns assets:`, userAssets);

    res.json({
      success: true,
      assets: userAssets,
    });
  } catch (err) {
    console.error("Failed to get user assets:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Asset Info
app.get("/api/getAsset/:contractAddress/:assetId", async (req, res) => {
  const { contractAddress, assetId } = req.params;

  try {
    console.log(`Fetching asset info for asset ${assetId}...`);

    const contract = new ethers.Contract(
      contractAddress,
      ASSET_HUB_ABI,
      wallet
    );
    const assetInfo = await contract.getAsset(assetId);

    res.json({
      success: true,
      asset: {
        name: assetInfo[0],
        symbol: assetInfo[1],
        decimals: Number(assetInfo[2]),
        totalSupply: assetInfo[3].toString(),
        creator: assetInfo[4],
        exists: assetInfo[5],
      },
    });
  } catch (err) {
    console.error("Failed to fetch asset info:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Balance
app.get(
  "/api/getBalance/:contractAddress/:assetId/:account",
  async (req, res) => {
    const { contractAddress, assetId, account } = req.params;

    try {
      console.log(
        `Fetching balance for account ${account} in asset ${assetId}...`
      );

      const contract = new ethers.Contract(
        contractAddress,
        ASSET_HUB_ABI,
        wallet
      );
      const balance = await contract.getBalance(assetId, account);

      res.json({
        success: true,
        balance: balance.toString(),
      });
    } catch (err) {
      console.error("Failed to fetch balance:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// Check if Account is Frozen
app.get(
  "/api/isAccountFrozen/:contractAddress/:assetId/:account",
  async (req, res) => {
    const { contractAddress, assetId, account } = req.params;

    try {
      console.log(
        `Checking freeze status for account ${account} in asset ${assetId}...`
      );

      const contract = new ethers.Contract(
        contractAddress,
        ASSET_HUB_ABI,
        wallet
      );
      const isFrozen = await contract.isAccountFrozen(assetId, account);

      res.json({
        success: true,
        isFrozen: isFrozen,
      });
    } catch (err) {
      console.error("Failed to check freeze status:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// Get User Assets (original contract function)
app.get(
  "/api/getUserAssets/:contractAddress/:userAddress",
  async (req, res) => {
    const { contractAddress, userAddress } = req.params;

    try {
      console.log(`Fetching assets for user ${userAddress}...`);

      const contract = new ethers.Contract(
        contractAddress,
        ASSET_HUB_ABI,
        wallet
      );
      const userAssets = await contract.getUserAssets(userAddress);

      res.json({
        success: true,
        assets: userAssets.map((id) => Number(id)),
      });
    } catch (err) {
      console.error("Failed to fetch user assets:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// Get Next Asset ID
app.get("/api/getNextAssetId/:contractAddress", async (req, res) => {
  const { contractAddress } = req.params;

  try {
    console.log(`Fetching next asset ID...`);

    const contract = new ethers.Contract(
      contractAddress,
      ASSET_HUB_ABI,
      wallet
    );
    const nextAssetId = await contract.nextAssetId();

    res.json({
      success: true,
      nextAssetId: Number(nextAssetId),
    });
  } catch (err) {
    console.error("Failed to fetch next asset ID:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Assets (for admin purposes)
app.get("/api/getAllAssets/:contractAddress", async (req, res) => {
  const { contractAddress } = req.params;

  try {
    console.log(`Fetching all assets...`);

    const contract = new ethers.Contract(
      contractAddress,
      ASSET_HUB_ABI,
      wallet
    );
    const nextAssetId = await contract.nextAssetId();

    const allAssets = [];
    for (let i = 0; i < Number(nextAssetId); i++) {
      allAssets.push(i);
    }

    res.json({
      success: true,
      assets: allAssets,
    });
  } catch (err) {
    console.error("Failed to fetch all assets:", err.message);
    res.status(500).json({ success: false, error: err.message     });
  }
});

// Get monitoring status
app.get("/api/monitor/status", async (req, res) => {
  try {
    const status = getMonitoringStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error("❌ Failed to get monitoring status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Stop monitoring for a specific contract
app.post("/api/monitor/stop", async (req, res) => {
  try {
    const { contractAddress } = req.body;

    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        error: "contractAddress is required",
      });
    }

    const stopped = stopEventMonitoring(contractAddress);

    if (stopped) {
      // Send Telegram notification for stopped monitoring
      if (TELEGRAM_CONFIG.ENABLE_NOTIFICATIONS) {
        sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID,
          `🛑 Contract Monitoring Stopped!\n` +
          `🔗 Address: ${contractAddress.slice(0, 10)}...\n` +
          `🕒 Stopped: ${new Date().toLocaleString()}`
        ).catch(console.error);
      }

      res.json({
        success: true,
        message: `Monitoring stopped for ${contractAddress}`,
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Contract not found in monitoring list",
      });
    }
  } catch (error) {
    console.error("❌ Failed to stop monitoring:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test telegram notification
app.post("/api/telegram/test", async (req, res) => {
  try {
    const { message } = req.body;
    const testMessage = message || "🧪 Test notification from Polkaflow!";

    const result = await sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID, testMessage);

    res.json({
      success: true,
      message: "Test notification sent successfully",
      messageId: result.messageId
    });
  } catch (error) {
    console.error("❌ Failed to send test notification:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/rust/compile", handleRustCode);

// Handle graceful shutdown
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
  console.log("📡 Event monitoring system initialized");
  console.log("👥 User asset tracking enabled");
});
