const express = require('express');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const router = express.Router();

// Configuration
const RELAY_CHAIN_WS = 'ws://127.0.0.1:9944';
const PARACHAIN_1000_WS = 'ws://127.0.0.1:9946';
const PARACHAIN_1001_WS = 'ws://127.0.0.1:9947';

// Initialize API connections
let relayApi = null;
let para1000Api = null;
let para1001Api = null;

// Initialize connections
async function initConnections() {
  try {
    if (!relayApi) {
      const relayProvider = new WsProvider(RELAY_CHAIN_WS);
      relayApi = await ApiPromise.create({ provider: relayProvider });
    }
    
    if (!para1000Api) {
      const para1000Provider = new WsProvider(PARACHAIN_1000_WS);
      para1000Api = await ApiPromise.create({ provider: para1000Provider });
    }
    
    if (!para1001Api) {
      const para1001Provider = new WsProvider(PARACHAIN_1001_WS);
      para1001Api = await ApiPromise.create({ provider: para1001Provider });
    }
    
    console.log('All API connections initialized');
  } catch (error) {
    console.error('Failed to initialize connections:', error);
    throw error;
  }
}

// Create keyring and accounts
async function createKeyring() {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'sr25519' });
  
  // Test accounts
  const alice = keyring.addFromUri('//Alice');
  const bob = keyring.addFromUri('//Bob');
  const charlie = keyring.addFromUri('//Charlie');
  const dave = keyring.addFromUri('//Dave');
  const eve = keyring.addFromUri('//Eve');
  const ferdie = keyring.addFromUri('//Ferdie');
  
  return { keyring, alice, bob, charlie, dave, eve, ferdie };
}

// HRMP Channel Management Functions

/**
 * Open HRMP channel from source parachain to destination parachain
 * @param {number} srcParaId - Source parachain ID
 * @param {number} destParaId - Destination parachain ID  
 * @param {number} maxCapacity - Maximum number of messages in queue (default: 8)
 * @param {number} maxMessageSize - Maximum message size in bytes (default: 1024)
 */
async function openHrmpChannel(srcParaId, destParaId, maxCapacity = 8, maxMessageSize = 1024) {
  await initConnections();
  const { alice } = await createKeyring();
  
  try {
    const tx = relayApi.tx.hrmp.hrmpInitOpenChannel(destParaId, maxCapacity, maxMessageSize);
    
    return new Promise((resolve, reject) => {
      tx.signAndSend(alice, ({ status, events, dispatchError }) => {
        if (status.isInBlock) {
          console.log(`HRMP channel init included in block: ${status.asInBlock}`);
        } else if (status.isFinalized) {
          console.log(`HRMP channel init finalized: ${status.asFinalized}`);
          
          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = relayApi.registry.findMetaError(dispatchError.asModule);
              reject(new Error(`${decoded.section}.${decoded.name}: ${decoded.docs}`));
            } else {
              reject(new Error(dispatchError.toString()));
            }
          } else {
            resolve({
              success: true,
              blockHash: status.asFinalized.toString(),
              events: events.map(({ event }) => `${event.section}.${event.method}`),
              message: `HRMP channel initiated from ${srcParaId} to ${destParaId}`
            });
          }
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to open HRMP channel: ${error.message}`);
  }
}

/**
 * Accept HRMP channel request
 * @param {number} srcParaId - Source parachain ID that initiated the channel
 */
async function acceptHrmpChannel(srcParaId) {
  await initConnections();
  const { alice } = await createKeyring();
  
  try {
    const tx = relayApi.tx.hrmp.hrmpAcceptOpenChannel(srcParaId);
    
    return new Promise((resolve, reject) => {
      tx.signAndSend(alice, ({ status, events, dispatchError }) => {
        if (status.isInBlock) {
          console.log(`HRMP channel accept included in block: ${status.asInBlock}`);
        } else if (status.isFinalized) {
          console.log(`HRMP channel accept finalized: ${status.asFinalized}`);
          
          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = relayApi.registry.findMetaError(dispatchError.asModule);
              reject(new Error(`${decoded.section}.${decoded.name}: ${decoded.docs}`));
            } else {
              reject(new Error(dispatchError.toString()));
            }
          } else {
            resolve({
              success: true,
              blockHash: status.asFinalized.toString(),
              events: events.map(({ event }) => `${event.section}.${event.method}`),
              message: `HRMP channel accepted from ${srcParaId}`
            });
          }
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to accept HRMP channel: ${error.message}`);
  }
}

/**
 * Setup bidirectional HRMP channels between two parachains
 * @param {number} paraId1 - First parachain ID
 * @param {number} paraId2 - Second parachain ID
 * @param {number} maxCapacity - Maximum number of messages in queue
 * @param {number} maxMessageSize - Maximum message size in bytes
 */
async function setupBidirectionalChannels(paraId1, paraId2, maxCapacity = 8, maxMessageSize = 1024) {
  try {
    // Open channel from paraId1 to paraId2
    const channel1to2 = await openHrmpChannel(paraId1, paraId2, maxCapacity, maxMessageSize);
    
    // Open channel from paraId2 to paraId1  
    const channel2to1 = await openHrmpChannel(paraId2, paraId1, maxCapacity, maxMessageSize);
    
    // Accept both channels
    const accept1 = await acceptHrmpChannel(paraId1);
    const accept2 = await acceptHrmpChannel(paraId2);
    
    return {
      success: true,
      channels: {
        [`${paraId1}to${paraId2}`]: channel1to2,
        [`${paraId2}to${paraId1}`]: channel2to1,
        [`accept${paraId1}`]: accept1,
        [`accept${paraId2}`]: accept2
      },
      message: `Bidirectional HRMP channels established between ${paraId1} and ${paraId2}`
    };
  } catch (error) {
    throw new Error(`Failed to setup bidirectional channels: ${error.message}`);
  }
}

// XCM Transfer Functions

/**
 * Transfer tokens between parachains using XCM
 * @param {number} srcParaId - Source parachain ID
 * @param {number} destParaId - Destination parachain ID
 * @param {string} amount - Amount to transfer (in smallest unit)
 * @param {string} tokenSymbol - Token symbol (e.g., "UNIT")
 * @param {string} senderKey - Sender account key (e.g., "//Alice")
 * @param {string} recipient - Recipient address (optional, defaults to sender)
 */
async function transferXcmTokens(srcParaId, destParaId, amount, tokenSymbol = "UNIT", senderKey = "//Alice", recipient = null) {
  await initConnections();
  const { keyring } = await createKeyring();
  const sender = keyring.addFromUri(senderKey);
  
  // Get the appropriate API connection
  let srcApi;
  if (srcParaId === 1000) {
    srcApi = para1000Api;
  } else if (srcParaId === 1001) {
    srcApi = para1001Api;
  } else {
    throw new Error(`Unsupported parachain ID: ${srcParaId}`);
  }
  
  try {
    // Create destination MultiLocation
    const destination = {
      V3: {
        parents: 1,
        interior: {
          X1: {
            Parachain: destParaId
          }
        }
      }
    };
    
    // Create asset specification
    const asset = {
      Token: tokenSymbol
    };
    
    // Create the XCM transfer transaction
    const tx = srcApi.tx.xTokens.transfer(
      asset,
      amount,
      destination,
      "Unlimited" // Fee weight limit
    );
    
    return new Promise((resolve, reject) => {
      tx.signAndSend(sender, ({ status, events, dispatchError }) => {
        if (status.isInBlock) {
          console.log(`XCM transfer included in block: ${status.asInBlock}`);
        } else if (status.isFinalized) {
          console.log(`XCM transfer finalized: ${status.asFinalized}`);
          
          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = srcApi.registry.findMetaError(dispatchError.asModule);
              reject(new Error(`${decoded.section}.${decoded.name}: ${decoded.docs}`));
            } else {
              reject(new Error(dispatchError.toString()));
            }
          } else {
            resolve({
              success: true,
              blockHash: status.asFinalized.toString(),
              events: events.map(({ event }) => `${event.section}.${event.method}`),
              transfer: {
                from: srcParaId,
                to: destParaId,
                amount: amount,
                token: tokenSymbol,
                sender: sender.address
              }
            });
          }
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to transfer XCM tokens: ${error.message}`);
  }
}

/**
 * Get account balance on a specific parachain
 * @param {number} paraId - Parachain ID
 * @param {string} accountAddress - Account address
 */
async function getAccountBalance(paraId, accountAddress) {
  await initConnections();
  
  let api;
  if (paraId === 1000) {
    api = para1000Api;
  } else if (paraId === 1001) {
    api = para1001Api;
  } else {
    throw new Error(`Unsupported parachain ID: ${paraId}`);
  }
  
  try {
    const { data: balance } = await api.query.system.account(accountAddress);
    
    return {
      paraId: paraId,
      address: accountAddress,
      free: balance.free.toString(),
      reserved: balance.reserved.toString(),
      miscFrozen: balance.miscFrozen.toString(),
      feeFrozen: balance.feeFrozen.toString()
    };
  } catch (error) {
    throw new Error(`Failed to get account balance: ${error.message}`);
  }
}

// API Routes

// Initialize connections
router.post('/init', async (req, res) => {
  try {
    await initConnections();
    res.json({
      success: true,
      message: 'XCM connections initialized',
      endpoints: {
        relayChain: RELAY_CHAIN_WS,
        parachain1000: PARACHAIN_1000_WS,
        parachain1001: PARACHAIN_1001_WS
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Open HRMP channel
router.post('/hrmp/open', async (req, res) => {
  try {
    const { srcParaId, destParaId, maxCapacity = 8, maxMessageSize = 1024 } = req.body;
    
    if (!srcParaId || !destParaId) {
      return res.status(400).json({
        success: false,
        error: 'srcParaId and destParaId are required'
      });
    }
    
    const result = await openHrmpChannel(srcParaId, destParaId, maxCapacity, maxMessageSize);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Accept HRMP channel
router.post('/hrmp/accept', async (req, res) => {
  try {
    const { srcParaId } = req.body;
    
    if (!srcParaId) {
      return res.status(400).json({
        success: false,
        error: 'srcParaId is required'
      });
    }
    
    const result = await acceptHrmpChannel(srcParaId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Setup bidirectional channels
router.post('/hrmp/setup-bidirectional', async (req, res) => {
  try {
    const { paraId1, paraId2, maxCapacity = 8, maxMessageSize = 1024 } = req.body;
    
    if (!paraId1 || !paraId2) {
      return res.status(400).json({
        success: false,
        error: 'paraId1 and paraId2 are required'
      });
    }
    
    const result = await setupBidirectionalChannels(paraId1, paraId2, maxCapacity, maxMessageSize);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transfer XCM tokens
router.post('/transfer', async (req, res) => {
  try {
    const { 
      srcParaId, 
      destParaId, 
      amount, 
      tokenSymbol = "UNIT", 
      senderKey = "//Alice",
      recipient = null 
    } = req.body;
    
    if (!srcParaId || !destParaId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'srcParaId, destParaId, and amount are required'
      });
    }
    
    const result = await transferXcmTokens(srcParaId, destParaId, amount, tokenSymbol, senderKey, recipient);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get account balance
router.get('/balance/:paraId/:address', async (req, res) => {
  try {
    const { paraId, address } = req.params;
    
    const result = await getAccountBalance(parseInt(paraId), address);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get balances for all test accounts
router.get('/balances/:paraId', async (req, res) => {
  try {
    const { paraId } = req.params;
    const { alice, bob, charlie, dave, eve, ferdie } = await createKeyring();
    
    const accounts = [
      { name: 'Alice', address: alice.address },
      { name: 'Bob', address: bob.address },
      { name: 'Charlie', address: charlie.address },
      { name: 'Dave', address: dave.address },
      { name: 'Eve', address: eve.address },
      { name: 'Ferdie', address: ferdie.address }
    ];
    
    const balances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await getAccountBalance(parseInt(paraId), account.address);
        return {
          ...account,
          ...balance
        };
      })
    );
    
    res.json({
      paraId: parseInt(paraId),
      balances: balances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 