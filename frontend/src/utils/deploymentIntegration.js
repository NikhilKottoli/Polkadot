import { toast } from 'sonner';

// Same storage key as ContractDashboard
const CONTRACTS_STORAGE_KEY = 'deployed_contracts';

// Get stored contracts
export const getStoredContracts = () => {
  try {
    const stored = localStorage.getItem(CONTRACTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading contracts from localStorage:', error);
    return [];
  }
};

// Save contracts to localStorage
export const saveContracts = (contracts) => {
  try {
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(contracts));
  } catch (error) {
    console.error('Error saving contracts to localStorage:', error);
    toast.error('Failed to save contracts data');
  }
};

// Add a newly deployed contract
export const addDeployedContract = (contractData) => {
  const contracts = getStoredContracts();
  
  // Check if contract already exists
  const existingContract = contracts.find(c => 
    c.address.toLowerCase() === contractData.address.toLowerCase()
  );
  
  if (existingContract) {
    toast.info('Contract already exists in dashboard');
    return existingContract;
  }

  const newContract = {
    id: Date.now().toString(),
    name: contractData.name || 'Deployed Contract',
    address: contractData.address,
    description: contractData.description || 'Auto-added after deployment',
    network: contractData.network || 'AssetHub',
    abi: contractData.abi,
    flowchartNodes: contractData.flowchartNodes || [],
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    deploymentTx: contractData.deploymentTx || null,
    deployedBy: contractData.deployedBy || 'User'
  };

  contracts.push(newContract);
  saveContracts(contracts);
  
  toast.success(`Contract "${newContract.name}" added to dashboard!`);
  return newContract;
};

// Hook for contract deployment workflow
export const useDeploymentIntegration = () => {
  
  const handleDeploymentSuccess = (deploymentResult) => {
    const {
      contractAddress,
      transactionHash,
      abi,
      contractName,
      network = 'AssetHub',
      description,
      flowchartNodes = []
    } = deploymentResult;

    // Validate required fields
    if (!contractAddress || !abi) {
      toast.error('Missing contract address or ABI for dashboard integration');
      return null;
    }

    // Auto-add to dashboard
    const contractData = {
      name: contractName || 'New Contract',
      address: contractAddress,
      description: description || `Deployed via transaction ${transactionHash}`,
      network,
      abi,
      flowchartNodes,
      deploymentTx: transactionHash,
      deployedBy: 'User'
    };

    return addDeployedContract(contractData);
  };

  const promptToAddContract = (deploymentResult) => {
    const { contractAddress, contractName } = deploymentResult;
    
    const shouldAdd = window.confirm(
      `Contract "${contractName || 'New Contract'}" deployed successfully!\n\n` +
      `Address: ${contractAddress}\n\n` +
      'Would you like to add it to your dashboard for testing?'
    );

    if (shouldAdd) {
      return handleDeploymentSuccess(deploymentResult);
    }
    
    return null;
  };

  return {
    handleDeploymentSuccess,
    promptToAddContract
  };
};

// Example: Integration with contract deployment
export const exampleDeploymentWorkflow = async (contractCode, constructorArgs) => {
  try {
    // This is a mock deployment function - replace with your actual deployment logic
    const deploymentResult = await deployContract(contractCode, constructorArgs);
    
    // Auto-add to dashboard after successful deployment
    const { handleDeploymentSuccess } = useDeploymentIntegration();
    const savedContract = handleDeploymentSuccess({
      contractAddress: deploymentResult.address,
      transactionHash: deploymentResult.txHash,
      abi: deploymentResult.abi,
      contractName: 'My New Contract',
      network: 'AssetHub',
      description: 'Deployed from web interface',
      flowchartNodes: [
        { id: 'node1', label: 'Initialize', functionName: 'initialize' },
        { id: 'node2', label: 'Execute', functionName: 'execute' }
      ]
    });

    if (savedContract) {
      // Optionally redirect to testing interface
      const shouldTest = window.confirm(
        'Contract added to dashboard! Would you like to test it now?'
      );
      
      if (shouldTest) {
        // Navigate to testing interface
        window.location.href = `/dashboard?test=${savedContract.id}`;
      }
    }

    return deploymentResult;
  } catch (error) {
    console.error('Deployment failed:', error);
    toast.error(`Deployment failed: ${error.message}`);
    throw error;
  }
};

// Mock deployment function (replace with actual implementation)
const deployContract = async (contractCode, constructorArgs) => {
  // This would be your actual deployment logic using ethers.js
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        address: '0x' + Math.random().toString(16).substr(2, 40),
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        abi: [
          {
            "name": "initialize",
            "type": "function",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
          },
          {
            "name": "execute",
            "type": "function",
            "inputs": [{"name": "data", "type": "bytes"}],
            "outputs": [],
            "stateMutability": "nonpayable"
          }
        ]
      });
    }, 2000);
  });
};

// Utility to generate ABI from Solidity source (optional)
export const extractABIFromSource = (soliditySource) => {
  // This would use a Solidity compiler to extract ABI
  // For now, return empty array - implement based on your compilation setup
  console.log('Extracting ABI from source:', soliditySource);
  return [];
};

// Helper to validate contract on network before adding
export const validateContractOnNetwork = async (address, network, provider) => {
  try {
    // Check if address has contract code
    const code = await provider.getCode(address);
    if (code === '0x') {
      return { isValid: false, error: 'No contract found at this address' };
    }

    // Additional validation can be added here
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// Export contract data for backup/sharing
export const exportContractsData = () => {
  const contracts = getStoredContracts();
  const exportData = {
    contracts,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contracts-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  toast.success('Contracts data exported successfully!');
};

// Import contract data from backup
export const importContractsData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (!importData.contracts || !Array.isArray(importData.contracts)) {
          throw new Error('Invalid backup file format');
        }

        const existingContracts = getStoredContracts();
        const newContracts = importData.contracts.filter(importContract => 
          !existingContracts.find(existing => 
            existing.address.toLowerCase() === importContract.address.toLowerCase()
          )
        );

        if (newContracts.length === 0) {
          toast.info('No new contracts found in backup file');
          resolve(0);
          return;
        }

        const allContracts = [...existingContracts, ...newContracts];
        saveContracts(allContracts);
        
        toast.success(`Imported ${newContracts.length} new contracts!`);
        resolve(newContracts.length);
      } catch (error) {
        console.error('Import failed:', error);
        toast.error(`Import failed: ${error.message}`);
        reject(error);
      }
    };

    reader.onerror = () => {
      const error = new Error('Failed to read file');
      toast.error('Failed to read backup file');
      reject(error);
    };

    reader.readAsText(file);
  });
}; 