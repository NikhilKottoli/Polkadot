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
app.post('/api/compile', async (req, res) => {
  console.log('Received /api/compile request');
  
  try {
    const sources = {
      'Contract.sol': {
        content: req.body.code
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
      `📦 Bytecode: ${bytecode.slice(0, 12)}...\n` +
      `📄 ABI entries: ${abi.length}`
    );


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
  const { bytecode, abi } = req.body;

  try {
    console.log('Deploying contract...');
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    console.log('Deployment successful');

    // Send Telegram notification
    sendTelegramMessage(CHAT_ID,
      `✅ Deployment Successful!\n` +
      `🔗 Contract Address: ${contract.target}\n` +
      `💰 Transaction Hash: ${contract.deploymentTransaction().hash}`
    );

    res.json({
      success: true,
      contractAddress: contract.target,
      transactionHash: contract.deploymentTransaction().hash
    });
  } catch (err) {
    console.error('Deployment failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
