const { formatBalance } = require('@polkadot/util');

/**
 * XCM Utility Functions
 * Common utilities for XCM operations and data formatting
 */

/**
 * Format balance with proper decimals
 * @param {string} balance - Balance in smallest unit
 * @param {number} decimals - Token decimals (default: 12)
 * @param {string} symbol - Token symbol (default: 'UNIT')
 */
function formatTokenBalance(balance, decimals = 12, symbol = 'UNIT') {
  return formatBalance(balance, { 
    decimals: decimals,
    withSi: true,
    withUnit: symbol
  });
}

/**
 * Convert human readable amount to smallest unit
 * @param {string|number} amount - Human readable amount (e.g., "1.5")
 * @param {number} decimals - Token decimals (default: 12)
 * @returns {string} Amount in smallest unit
 */
function toSmallestUnit(amount, decimals = 12) {
  const factor = Math.pow(10, decimals);
  return (parseFloat(amount) * factor).toString();
}

/**
 * Convert smallest unit to human readable amount
 * @param {string} amount - Amount in smallest unit
 * @param {number} decimals - Token decimals (default: 12)
 * @returns {string} Human readable amount
 */
function fromSmallestUnit(amount, decimals = 12) {
  const factor = Math.pow(10, decimals);
  return (parseFloat(amount) / factor).toString();
}

/**
 * Create MultiLocation for parachain
 * @param {number} paraId - Parachain ID
 * @param {string} account - Account address (optional)
 * @returns {object} MultiLocation object
 */
function createParachainMultiLocation(paraId, account = null) {
  const baseLocation = {
    V3: {
      parents: 1,
      interior: {
        X1: {
          Parachain: paraId
        }
      }
    }
  };

  if (account) {
    baseLocation.V3.interior = {
      X2: [
        { Parachain: paraId },
        { 
          AccountId32: {
            network: null,
            id: account
          }
        }
      ]
    };
  }

  return baseLocation;
}

/**
 * Create asset specification for XCM
 * @param {string} tokenSymbol - Token symbol
 * @param {number} paraId - Parachain ID where token originates (optional)
 * @returns {object} Asset specification
 */
function createAssetSpec(tokenSymbol, paraId = null) {
  if (paraId) {
    return {
      Foreign: {
        parents: 1,
        interior: {
          X2: [
            { Parachain: paraId },
            { GeneralKey: tokenSymbol }
          ]
        }
      }
    };
  }
  
  return {
    Token: tokenSymbol
  };
}

/**
 * Validate parachain ID
 * @param {number} paraId - Parachain ID to validate
 * @returns {boolean} True if valid
 */
function isValidParachainId(paraId) {
  return typeof paraId === 'number' && paraId >= 1000 && paraId <= 4999;
}

/**
 * Get default WebSocket endpoints
 * @returns {object} Default endpoint configuration
 */
function getDefaultEndpoints() {
  return {
    relayChain: 'ws://127.0.0.1:9944',
    parachain1000: 'ws://127.0.0.1:9946',
    parachain1001: 'ws://127.0.0.1:9947'
  };
}

/**
 * Parse XCM events from transaction result
 * @param {Array} events - Events from transaction
 * @returns {object} Parsed XCM events
 */
function parseXcmEvents(events) {
  const xcmEvents = {
    sent: [],
    received: [],
    executed: [],
    failed: []
  };

  events.forEach(({ event }) => {
    const { section, method, data } = event;
    
    switch (`${section}.${method}`) {
      case 'xcmpQueue.XcmpMessageSent':
        xcmEvents.sent.push({
          type: 'sent',
          messageHash: data[0]?.toString(),
          section,
          method
        });
        break;
        
      case 'xcmpQueue.Success':
        xcmEvents.executed.push({
          type: 'executed',
          messageHash: data[0]?.toString(),
          weight: data[1]?.toString(),
          section,
          method
        });
        break;
        
      case 'xcmpQueue.Fail':
        xcmEvents.failed.push({
          type: 'failed',
          messageHash: data[0]?.toString(),
          error: data[1]?.toString(),
          weight: data[2]?.toString(),
          section,
          method
        });
        break;
        
      case 'xTokens.Transferred':
        xcmEvents.sent.push({
          type: 'transferred',
          sender: data[0]?.toString(),
          currencyId: JSON.stringify(data[1]),
          amount: data[2]?.toString(),
          dest: JSON.stringify(data[3]),
          section,
          method
        });
        break;
        
      case 'balances.Transfer':
        xcmEvents.received.push({
          type: 'balance_transfer',
          from: data[0]?.toString(),
          to: data[1]?.toString(),
          amount: data[2]?.toString(),
          section,
          method
        });
        break;
        
      case 'system.ExtrinsicSuccess':
        xcmEvents.executed.push({
          type: 'extrinsic_success',
          dispatchInfo: JSON.stringify(data[0]),
          section,
          method
        });
        break;
        
      case 'system.ExtrinsicFailed':
        xcmEvents.failed.push({
          type: 'extrinsic_failed',
          dispatchError: JSON.stringify(data[0]),
          dispatchInfo: JSON.stringify(data[1]),
          section,
          method
        });
        break;
    }
  });

  return xcmEvents;
}

/**
 * Create comprehensive transaction result
 * @param {object} status - Transaction status
 * @param {Array} events - Transaction events
 * @param {object} additionalData - Additional data to include
 * @returns {object} Formatted transaction result
 */
function createTransactionResult(status, events, additionalData = {}) {
  const xcmEvents = parseXcmEvents(events);
  
  return {
    success: true,
    blockHash: status.asFinalized?.toString() || status.asInBlock?.toString(),
    events: events.map(({ event }) => `${event.section}.${event.method}`),
    xcmEvents,
    timestamp: new Date().toISOString(),
    ...additionalData
  };
}

/**
 * Estimate XCM transfer fee (rough estimation)
 * @param {string} amount - Transfer amount
 * @param {number} decimals - Token decimals
 * @returns {string} Estimated fee in smallest unit
 */
function estimateXcmFee(amount, decimals = 12) {
  // Rough estimation: 0.1% of transfer amount + base fee
  const baseFee = toSmallestUnit('0.01', decimals); // 0.01 UNIT base fee
  const percentageFee = (BigInt(amount) * BigInt(1)) / BigInt(1000); // 0.1%
  
  return (BigInt(baseFee) + percentageFee).toString();
}

/**
 * Validate XCM transfer parameters
 * @param {object} params - Transfer parameters
 * @returns {object} Validation result
 */
function validateXcmTransfer(params) {
  const { srcParaId, destParaId, amount, tokenSymbol } = params;
  const errors = [];

  if (!isValidParachainId(srcParaId)) {
    errors.push('Invalid source parachain ID');
  }

  if (!isValidParachainId(destParaId)) {
    errors.push('Invalid destination parachain ID');
  }

  if (srcParaId === destParaId) {
    errors.push('Source and destination parachains cannot be the same');
  }

  if (!amount || parseFloat(amount) <= 0) {
    errors.push('Invalid transfer amount');
  }

  if (!tokenSymbol || typeof tokenSymbol !== 'string') {
    errors.push('Invalid token symbol');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create HRMP channel configuration
 * @param {number} maxCapacity - Maximum messages in queue
 * @param {number} maxMessageSize - Maximum message size in bytes
 * @returns {object} Channel configuration
 */
function createHrmpChannelConfig(maxCapacity = 8, maxMessageSize = 1024) {
  return {
    maxCapacity,
    maxMessageSize,
    description: `Channel allows ${maxCapacity} messages in queue, max ${maxMessageSize} bytes per message`
  };
}

/**
 * Common test account keys
 */
const TEST_ACCOUNTS = {
  ALICE: '//Alice',
  BOB: '//Bob',
  CHARLIE: '//Charlie',
  DAVE: '//Dave',
  EVE: '//Eve',
  FERDIE: '//Ferdie'
};

/**
 * Common parachain IDs for testing
 */
const PARACHAIN_IDS = {
  PARACHAIN_1000: 1000,
  PARACHAIN_1001: 1001,
  STATEMINT: 1000,
  STATEMINE: 1000
};

/**
 * Common token configurations
 */
const TOKEN_CONFIGS = {
  UNIT: {
    symbol: 'UNIT',
    decimals: 12,
    name: 'Unit Token'
  },
  DOT: {
    symbol: 'DOT',
    decimals: 10,
    name: 'Polkadot'
  },
  KSM: {
    symbol: 'KSM',
    decimals: 12,
    name: 'Kusama'
  }
};

module.exports = {
  // Formatting functions
  formatTokenBalance,
  toSmallestUnit,
  fromSmallestUnit,
  
  // XCM construction functions
  createParachainMultiLocation,
  createAssetSpec,
  createHrmpChannelConfig,
  
  // Validation functions
  isValidParachainId,
  validateXcmTransfer,
  
  // Utility functions
  getDefaultEndpoints,
  parseXcmEvents,
  createTransactionResult,
  estimateXcmFee,
  
  // Constants
  TEST_ACCOUNTS,
  PARACHAIN_IDS,
  TOKEN_CONFIGS
}; 