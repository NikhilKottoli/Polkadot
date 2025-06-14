import { ethers } from 'ethers';

// Advanced Solidity type validation
export const validateSolidityType = (value, type) => {
  try {
    switch (type) {
      case 'address':
        if (typeof value !== 'string') return { isValid: false, error: 'Address must be a string' };
        if (!ethers.isAddress(value)) return { isValid: false, error: 'Invalid Ethereum address format' };
        return { isValid: true };

      case 'bytes32':
        if (typeof value !== 'string') return { isValid: false, error: 'Bytes32 must be a string' };
        if (!/^0x[a-fA-F0-9]{64}$/.test(value)) return { isValid: false, error: 'Bytes32 must be 66 characters (0x + 64 hex chars)' };
        return { isValid: true };

      case 'string':
        if (typeof value !== 'string') return { isValid: false, error: 'Value must be a string' };
        return { isValid: true };

      case 'bool':
        if (typeof value !== 'boolean') return { isValid: false, error: 'Value must be a boolean' };
        return { isValid: true };

      default:
        // Handle uint/int types
        if (type.startsWith('uint') || type.startsWith('int')) {
          if (isNaN(Number(value)) || value === '') {
            return { isValid: false, error: `${type} must be a valid number` };
          }
          
          const num = BigInt(value);
          if (type.startsWith('uint') && num < 0) {
            return { isValid: false, error: 'Unsigned integers cannot be negative' };
          }

          // Check bit size limits
          const bitSize = parseInt(type.replace(/uint|int/, '')) || 256;
          const maxValue = type.startsWith('uint') 
            ? BigInt(2) ** BigInt(bitSize) - BigInt(1)
            : BigInt(2) ** BigInt(bitSize - 1) - BigInt(1);
          const minValue = type.startsWith('uint') 
            ? BigInt(0)
            : -(BigInt(2) ** BigInt(bitSize - 1));

          if (num > maxValue || num < minValue) {
            return { isValid: false, error: `Value out of range for ${type}` };
          }
          return { isValid: true };
        }

        // Handle bytes types
        if (type.startsWith('bytes') && type !== 'bytes') {
          const size = parseInt(type.replace('bytes', ''));
          if (typeof value !== 'string') return { isValid: false, error: 'Bytes must be a string' };
          if (!value.startsWith('0x')) return { isValid: false, error: 'Bytes must start with 0x' };
          if (value.length !== 2 + size * 2) {
            return { isValid: false, error: `${type} must be exactly ${size * 2} hex characters after 0x` };
          }
          return { isValid: true };
        }

        // Handle arrays
        if (type.includes('[]')) {
          if (!Array.isArray(value)) return { isValid: false, error: 'Array type must be an array' };
          const baseType = type.replace('[]', '');
          for (let i = 0; i < value.length; i++) {
            const itemValidation = validateSolidityType(value[i], baseType);
            if (!itemValidation.isValid) {
              return { isValid: false, error: `Item ${i}: ${itemValidation.error}` };
            }
          }
          return { isValid: true };
        }

        // Default case for unknown types
        return { isValid: true };
    }
  } catch (error) {
    return { isValid: false, error: `Validation error: ${error.message}` };
  }
};

// Advanced input formatting for contract calls
export const formatSolidityValue = (value, type) => {
  try {
    switch (type) {
      case 'address':
        return ethers.getAddress(value); // Checksummed address

      case 'bytes32':
        return value; // Already validated

      case 'string':
        return String(value);

      case 'bool':
        return Boolean(value);

      default:
        // Handle uint/int types
        if (type.startsWith('uint') || type.startsWith('int')) {
          return BigInt(value);
        }

        // Handle bytes types
        if (type.startsWith('bytes')) {
          return value; // Ethers will handle the conversion
        }

        // Handle arrays
        if (type.includes('[]')) {
          const baseType = type.replace('[]', '');
          return Array.isArray(value) 
            ? value.map(item => formatSolidityValue(item, baseType))
            : [];
        }

        return value;
    }
  } catch (error) {
    throw new Error(`Failed to format ${type}: ${error.message}`);
  }
};

// Gas estimation helper
export const estimateGas = async (contract, functionName, args) => {
  try {
    const estimated = await contract[functionName].estimateGas(...args);
    const gasPrice = await contract.runner?.provider?.getFeeData();
    
    const limit = estimated + (estimated / BigInt(10)); // Add 10% buffer
    const price = gasPrice?.gasPrice || BigInt(0);
    const total = limit * price;

    return {
      estimated,
      limit,
      price,
      total
    };
  } catch (error) {
    throw new Error(`Gas estimation failed: ${error.message}`);
  }
};

// Parse contract error messages
export const parseContractError = (error) => {
  const parsed = {};

  if (error.reason) {
    parsed.reason = error.reason;
  }

  if (error.code) {
    parsed.code = error.code;
  }

  if (error.method) {
    parsed.method = error.method;
  }

  if (error.data) {
    parsed.data = error.data;
  }

  // Try to extract revert reason from error message
  if (error.message) {
    const revertMatch = error.message.match(/reverted with reason string '(.+)'/);
    if (revertMatch) {
      parsed.reason = revertMatch[1];
    }
  }

  return parsed;
};

// Generate default values for different Solidity types
export const getDefaultValue = (type) => {
  switch (type) {
    case 'address':
      return '0x0000000000000000000000000000000000000000';
    case 'bytes32':
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
    case 'string':
      return '';
    case 'bool':
      return false;
    default:
      if (type.startsWith('uint') || type.startsWith('int')) {
        return '0';
      }
      if (type.startsWith('bytes')) {
        const size = parseInt(type.replace('bytes', '')) || 32;
        return '0x' + '00'.repeat(size);
      }
      if (type.includes('[]')) {
        return [];
      }
      return '';
  }
};

// Format return values for display
export const formatReturnValue = (value, type) => {
  if (value === null || value === undefined) {
    return 'null';
  }

  // Handle BigInt values
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return JSON.stringify(value.map(item => formatReturnValue(item)), null, 2);
  }

  // Handle objects
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, (key, val) => {
        return typeof val === 'bigint' ? val.toString() : val;
      }, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

// Check if function is payable
export const isPayableFunction = (func) => {
  return func.stateMutability === 'payable';
};

// Check if function is view/pure (read-only)
export const isReadOnlyFunction = (func) => {
  return func.stateMutability === 'view' || func.stateMutability === 'pure';
};

// Generate function signature
export const generateFunctionSignature = (func) => {
  const inputs = func.inputs.map((input) => input.type).join(',');
  return `${func.name}(${inputs})`;
};

// Convert ABI to human-readable format
export const formatABI = (abi) => {
  return abi
    .filter(item => item.type === 'function')
    .map(func => {
      const inputs = func.inputs.map((input) => `${input.type} ${input.name}`).join(', ');
      const outputs = func.outputs?.map((output) => output.type).join(', ') || 'void';
      return `function ${func.name}(${inputs}) ${func.stateMutability} returns (${outputs})`;
    })
    .join('\n');
};

// Validate contract address
export const validateContractAddress = async (address, provider) => {
  try {
    if (!ethers.isAddress(address)) {
      return { isValid: false, isContract: false, error: 'Invalid address format' };
    }

    const code = await provider.getCode(address);
    const isContract = code !== '0x';

    return { isValid: true, isContract };
  } catch (error) {
    return { isValid: false, isContract: false, error: error.message };
  }
};

// Generate transaction URL for block explorer
export const generateBlockExplorerUrl = (txHash, network = 'mainnet') => {
  const baseUrls = {
    mainnet: 'https://etherscan.io/tx/',
    goerli: 'https://goerli.etherscan.io/tx/',
    sepolia: 'https://sepolia.etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    bsc: 'https://bscscan.com/tx/',
    // Add more networks as needed
  };

  return `${baseUrls[network] || baseUrls.mainnet}${txHash}`;
}; 