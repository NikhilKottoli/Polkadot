# DynamicContractTester Component

A comprehensive React component that generates a dynamic UI for testing deployed smart contracts based on their ABI and flowchart data. Perfect for testing contracts on AssetHub/PolkaVM or any EVM-compatible network.

## Features

✅ **Dynamic UI Generation** - Automatically creates form inputs based on contract ABI  
✅ **Comprehensive Type Support** - All Solidity types (uint256, int256, string, address, bool, bytes32, arrays)  
✅ **MetaMask Integration** - Seamless wallet connection with ethers.js  
✅ **Transaction Management** - Display results, gas usage, and transaction hashes  
✅ **Flowchart Integration** - Highlight active nodes during testing  
✅ **Error Handling** - Robust validation and error reporting  
✅ **Responsive Design** - Beautiful Tailwind CSS styling  

## Installation

The component uses the following dependencies (already installed in your project):

```bash
npm install ethers sonner @heroicons/react lucide-react
```

## Basic Usage

```jsx
import DynamicContractTester from './components/DynamicContractTester';

const MyApp = () => {
  const contractABI = [
    {
      "name": "createAsset",
      "type": "function",
      "inputs": [
        {"name": "name", "type": "string"},
        {"name": "symbol", "type": "string"},
        {"name": "supply", "type": "uint256"}
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    }
  ];

  const flowchartNodes = [
    {id: 'node1', label: 'Create Asset', functionName: 'createAsset'}
  ];

  return (
    <DynamicContractTester
      contractAddress="0x8Eb30f83c4d219848eeca903b0b1d32bBcA7BE04"
      contractABI={contractABI}
      flowchartNodes={flowchartNodes}
      rpcUrl="https://asset-hub-evm-rpc-url"
    />
  );
};
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `contractAddress` | string | ✅ | - | Deployed contract address |
| `contractABI` | Array | ✅ | - | Contract ABI with function definitions |
| `flowchartNodes` | Array | ❌ | `[]` | Flowchart node mappings |
| `rpcUrl` | string | ❌ | `"https://asset-hub-evm-rpc-url"` | RPC endpoint URL |

## Contract ABI Format

Each function in the ABI should follow this structure:

```javascript
{
  "name": "functionName",           // Function name
  "type": "function",               // Must be "function"
  "inputs": [                       // Input parameters
    {
      "name": "paramName",          // Parameter name
      "type": "uint256"             // Solidity type
    }
  ],
  "outputs": [                      // Return values (optional)
    {
      "name": "returnName",
      "type": "bool"
    }
  ],
  "stateMutability": "nonpayable"   // view, pure, nonpayable, or payable
}
```

## Supported Solidity Types

### Basic Types
- **`uint256`, `int256`** - Number inputs with validation
- **`string`** - Text input fields
- **`address`** - Ethereum address with checksum validation
- **`bool`** - Checkbox inputs
- **`bytes32`** - Hex input (66 characters with 0x prefix)

### Array Types
- **`uint256[]`, `address[]`** - Dynamic arrays with add/remove functionality
- **`string[]`** - Array of text inputs

### Advanced Features
- Automatic input validation for all types
- Gas estimation for write functions
- Transaction status tracking
- Error message parsing

## Flowchart Integration

Map contract functions to visual flowchart nodes:

```javascript
const flowchartNodes = [
  {
    id: 'node1',                    // Unique node identifier
    label: 'Create Asset',          // Display label
    functionName: 'createAsset'     // Contract function name
  },
  {
    id: 'node2',
    label: 'DAO Vote',
    functionName: 'vote'
  }
];
```

When a function is called, the corresponding node will be highlighted with a blue border and background.

## Function Types

### Read Functions (view/pure)
- **Color**: Green button
- **Behavior**: No gas required, instant results
- **Use Cases**: Getting balances, reading state

### Write Functions (nonpayable/payable)
- **Color**: Blue button  
- **Behavior**: Requires gas, shows transaction hash
- **Use Cases**: Transfers, state changes

## Error Handling

The component provides comprehensive error handling:

```javascript
// Input validation errors
"Invalid address format"
"Value out of range for uint256"
"Array type must be an array"

// Contract interaction errors
"MetaMask is not installed!"
"Contract not initialized!"
"Transaction failed: insufficient funds"
```

## Utility Functions

Additional helper functions are available in `utils/contractUtils.js`:

```javascript
import { 
  validateSolidityType,
  formatSolidityValue,
  estimateGas,
  parseContractError,
  generateBlockExplorerUrl 
} from '../utils/contractUtils';
```

## Example Contracts

### ERC20 Token

```javascript
const tokenABI = [
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [{"name": "account", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  }
];
```

### DAO Governance

```javascript
const daoABI = [
  {
    "name": "createProposal",
    "type": "function",
    "inputs": [
      {"name": "description", "type": "string"},
      {"name": "votingPeriod", "type": "uint256"}
    ],
    "outputs": [{"name": "proposalId", "type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "name": "vote",
    "type": "function",
    "inputs": [
      {"name": "proposalId", "type": "uint256"},
      {"name": "support", "type": "bool"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];
```

## Styling

The component uses Tailwind CSS classes and is fully responsive. Key style features:

- **Collapsible Cards** - Each function is in an expandable card
- **Color Coding** - Read functions (green), write functions (blue)
- **Loading States** - Spinners during transactions
- **Highlighted Nodes** - Active flowchart integration
- **Toast Notifications** - Success/error messages

## MetaMask Integration

The component automatically:

1. Detects MetaMask installation
2. Requests account access
3. Connects to the specified RPC URL
4. Handles network switching
5. Manages transaction signing

## Gas Management

For write functions, the component:

- Estimates gas before execution
- Displays gas usage after transactions
- Adds 10% buffer to gas estimates
- Shows gas price information

## Best Practices

1. **Always validate inputs** before calling contract functions
2. **Use descriptive flowchart labels** for better UX
3. **Handle errors gracefully** with user-friendly messages
4. **Test with read functions first** before attempting writes
5. **Provide clear contract addresses** and ensure they're deployed

## Troubleshooting

### Common Issues

**"MetaMask is not installed!"**
- Install MetaMask browser extension
- Refresh the page after installation

**"Contract not initialized!"**
- Check contract address is valid
- Verify contract is deployed on the network
- Ensure ABI matches the deployed contract

**"Invalid address format"**
- Addresses must be 42 characters starting with 0x
- Use checksummed addresses when possible

**Gas estimation failed**
- Check function parameters are correct
- Ensure sufficient ETH balance
- Verify contract function exists

## Development

To extend the component:

1. Add new Solidity types in `validateInput()` and `formatInputValue()`
2. Customize styling by modifying Tailwind classes
3. Add new utility functions in `contractUtils.js`
4. Extend error handling in `parseContractError()`

## License

This component is part of the Polkadot project and follows the project's licensing terms. 