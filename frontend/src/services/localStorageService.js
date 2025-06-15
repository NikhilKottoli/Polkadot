// Local Storage Service for Polkadot Workflow Management
export const LocalStorageService = {
  // Storage keys
  KEYS: {
    WORKFLOWS: 'polkadot_workflows',
    USER_PREFERENCES: 'polkadot_user_preferences',
    GENERATED_CONTRACTS: 'polkadot_generated_contracts',
    GAS_ESTIMATES: 'polkadot_gas_estimates',
    RUST_CONTRACTS: 'polkadot_rust_contracts',
    DEPLOYMENT_HISTORY: 'polkadot_deployment_history'
  },

  // Workflow Management
  saveWorkflow(workflowId, workflowData) {
    try {
      const workflows = this.getAllWorkflows();
      workflows[workflowId] = {
        ...workflowData,
        id: workflowId,
        createdAt: workflowData.createdAt || Date.now(),
        lastModified: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.KEYS.WORKFLOWS, JSON.stringify(workflows));
      console.log(`💾 [LocalStorage] Saved workflow: ${workflowId}`);
      return true;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to save workflow:', error);
      return false;
    }
  },

  getWorkflow(workflowId) {
    try {
      const workflows = this.getAllWorkflows();
      return workflows[workflowId] || null;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get workflow:', error);
      return null;
    }
  },

  getAllWorkflows() {
    try {
      const stored = localStorage.getItem(this.KEYS.WORKFLOWS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get all workflows:', error);
      return {};
    }
  },

  deleteWorkflow(workflowId) {
    try {
      const workflows = this.getAllWorkflows();
      delete workflows[workflowId];
      localStorage.setItem(this.KEYS.WORKFLOWS, JSON.stringify(workflows));
      console.log(`🗑️ [LocalStorage] Deleted workflow: ${workflowId}`);
      return true;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to delete workflow:', error);
      return false;
    }
  },

  // Generated Contracts Management
  saveGeneratedContract(contractId, contractData) {
    try {
      const contracts = this.getAllGeneratedContracts();
      contracts[contractId] = {
        ...contractData,
        id: contractId,
        savedAt: Date.now(),
        type: contractData.type || 'solidity'
      };
      
      localStorage.setItem(this.KEYS.GENERATED_CONTRACTS, JSON.stringify(contracts));
      console.log(`💾 [LocalStorage] Saved contract: ${contractId}`);
      return true;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to save contract:', error);
      return false;
    }
  },

  getGeneratedContract(contractId) {
    try {
      const contracts = this.getAllGeneratedContracts();
      return contracts[contractId] || null;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get contract:', error);
      return null;
    }
  },

  getAllGeneratedContracts() {
    try {
      const stored = localStorage.getItem(this.KEYS.GENERATED_CONTRACTS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get all contracts:', error);
      return {};
    }
  },

  // Gas Estimates Management
  saveGasEstimate(contractName, gasData) {
    try {
      const gasEstimates = this.getAllGasEstimates();
      const estimateId = `${contractName}_${Date.now()}`;
      
      gasEstimates[estimateId] = {
        contractName,
        ...gasData,
        estimatedAt: Date.now(),
        id: estimateId
      };
      
      localStorage.setItem(this.KEYS.GAS_ESTIMATES, JSON.stringify(gasEstimates));
      console.log(`💾 [LocalStorage] Saved gas estimate: ${estimateId}`);
      return estimateId;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to save gas estimate:', error);
      return null;
    }
  },

  getAllGasEstimates() {
    try {
      const stored = localStorage.getItem(this.KEYS.GAS_ESTIMATES);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get gas estimates:', error);
      return {};
    }
  },

  // Rust Contracts Management
  saveRustContract(functionName, rustData) {
    try {
      const rustContracts = this.getAllRustContracts();
      const contractId = `rust_${functionName}_${Date.now()}`;
      
      rustContracts[contractId] = {
        functionName,
        ...rustData,
        createdAt: Date.now(),
        id: contractId,
        status: 'generated'
      };
      
      localStorage.setItem(this.KEYS.RUST_CONTRACTS, JSON.stringify(rustContracts));
      console.log(`💾 [LocalStorage] Saved Rust contract: ${contractId}`);
      return contractId;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to save Rust contract:', error);
      return null;
    }
  },

  getRustContract(contractId) {
    try {
      const rustContracts = this.getAllRustContracts();
      return rustContracts[contractId] || null;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get Rust contract:', error);
      return null;
    }
  },

  getAllRustContracts() {
    try {
      const stored = localStorage.getItem(this.KEYS.RUST_CONTRACTS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get Rust contracts:', error);
      return {};
    }
  },

  updateRustContractStatus(contractId, status, deploymentData = {}) {
    try {
      const rustContracts = this.getAllRustContracts();
      if (rustContracts[contractId]) {
        rustContracts[contractId] = {
          ...rustContracts[contractId],
          status,
          ...deploymentData,
          lastUpdated: Date.now()
        };
        
        localStorage.setItem(this.KEYS.RUST_CONTRACTS, JSON.stringify(rustContracts));
        console.log(`🔄 [LocalStorage] Updated Rust contract status: ${contractId} -> ${status}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to update Rust contract status:', error);
      return false;
    }
  },

  // Deployment History Management
  saveDeployment(deploymentData) {
    try {
      const deployments = this.getAllDeployments();
      const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      deployments[deploymentId] = {
        ...deploymentData,
        id: deploymentId,
        deployedAt: Date.now(),
        status: deploymentData.status || 'deployed'
      };
      
      localStorage.setItem(this.KEYS.DEPLOYMENT_HISTORY, JSON.stringify(deployments));
      console.log(`💾 [LocalStorage] Saved deployment: ${deploymentId}`);
      return deploymentId;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to save deployment:', error);
      return null;
    }
  },

  getAllDeployments() {
    try {
      const stored = localStorage.getItem(this.KEYS.DEPLOYMENT_HISTORY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get deployments:', error);
      return {};
    }
  },

  // User Preferences Management
  saveUserPreferences(preferences) {
    try {
      const current = this.getUserPreferences();
      const updated = { ...current, ...preferences, lastUpdated: Date.now() };
      
      localStorage.setItem(this.KEYS.USER_PREFERENCES, JSON.stringify(updated));
      console.log('💾 [LocalStorage] Saved user preferences');
      return true;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to save preferences:', error);
      return false;
    }
  },

  getUserPreferences() {
    try {
      const stored = localStorage.getItem(this.KEYS.USER_PREFERENCES);
      return stored ? JSON.parse(stored) : {
        theme: 'light',
        defaultGasPrice: 20,
        autoSave: true,
        showRustRecommendations: true,
        preferredNetwork: 'polkadot-testnet'
      };
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get preferences:', error);
      return {};
    }
  },

  // Search and Filter Functions
  searchWorkflows(query) {
    try {
      const workflows = this.getAllWorkflows();
      const searchTerm = query.toLowerCase();
      
      return Object.values(workflows).filter(workflow => 
        workflow.name?.toLowerCase().includes(searchTerm) ||
        workflow.description?.toLowerCase().includes(searchTerm) ||
        workflow.id?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to search workflows:', error);
      return [];
    }
  },

  getWorkflowsByStatus(status) {
    try {
      const workflows = this.getAllWorkflows();
      return Object.values(workflows).filter(workflow => workflow.status === status);
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get workflows by status:', error);
      return [];
    }
  },

  getRecentWorkflows(limit = 10) {
    try {
      const workflows = this.getAllWorkflows();
      return Object.values(workflows)
        .sort((a, b) => b.lastModified - a.lastModified)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get recent workflows:', error);
      return [];
    }
  },

  // Statistics and Analytics
  getStorageStats() {
    try {
      const workflows = Object.keys(this.getAllWorkflows()).length;
      const contracts = Object.keys(this.getAllGeneratedContracts()).length;
      const rustContracts = Object.keys(this.getAllRustContracts()).length;
      const deployments = Object.keys(this.getAllDeployments()).length;
      const gasEstimates = Object.keys(this.getAllGasEstimates()).length;

      // Calculate storage usage (approximate)
      let totalSize = 0;
      Object.values(this.KEYS).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      });

      return {
        totalWorkflows: workflows,
        totalContracts: contracts,
        totalRustContracts: rustContracts,
        totalDeployments: deployments,
        totalGasEstimates: gasEstimates,
        approximateStorageSize: `${(totalSize / 1024).toFixed(2)} KB`,
        storageKeys: Object.keys(this.KEYS).length
      };
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to get storage stats:', error);
      return {};
    }
  },

  // Export and Import Functions
  exportAllData() {
    try {
      const exportData = {
        workflows: this.getAllWorkflows(),
        contracts: this.getAllGeneratedContracts(),
        rustContracts: this.getAllRustContracts(),
        deployments: this.getAllDeployments(),
        gasEstimates: this.getAllGasEstimates(),
        userPreferences: this.getUserPreferences(),
        exportedAt: Date.now(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to export data:', error);
      return null;
    }
  },

  importData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (data.workflows) {
        localStorage.setItem(this.KEYS.WORKFLOWS, JSON.stringify(data.workflows));
      }
      if (data.contracts) {
        localStorage.setItem(this.KEYS.GENERATED_CONTRACTS, JSON.stringify(data.contracts));
      }
      if (data.rustContracts) {
        localStorage.setItem(this.KEYS.RUST_CONTRACTS, JSON.stringify(data.rustContracts));
      }
      if (data.deployments) {
        localStorage.setItem(this.KEYS.DEPLOYMENT_HISTORY, JSON.stringify(data.deployments));
      }
      if (data.gasEstimates) {
        localStorage.setItem(this.KEYS.GAS_ESTIMATES, JSON.stringify(data.gasEstimates));
      }
      if (data.userPreferences) {
        localStorage.setItem(this.KEYS.USER_PREFERENCES, JSON.stringify(data.userPreferences));
      }

      console.log('✅ [LocalStorage] Successfully imported data');
      return true;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to import data:', error);
      return false;
    }
  },

  // Cleanup Functions
  clearOldData(daysOld = 30) {
    try {
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      let cleanedCount = 0;

      // Clean old workflows
      const workflows = this.getAllWorkflows();
      Object.keys(workflows).forEach(workflowId => {
        if (workflows[workflowId].lastModified < cutoffTime) {
          delete workflows[workflowId];
          cleanedCount++;
        }
      });
      localStorage.setItem(this.KEYS.WORKFLOWS, JSON.stringify(workflows));

      // Clean old gas estimates
      const gasEstimates = this.getAllGasEstimates();
      Object.keys(gasEstimates).forEach(estimateId => {
        if (gasEstimates[estimateId].estimatedAt < cutoffTime) {
          delete gasEstimates[estimateId];
          cleanedCount++;
        }
      });
      localStorage.setItem(this.KEYS.GAS_ESTIMATES, JSON.stringify(gasEstimates));

      console.log(`🧹 [LocalStorage] Cleaned ${cleanedCount} old records`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to clean old data:', error);
      return 0;
    }
  },

  clearAllData() {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('🧹 [LocalStorage] Cleared all data');
      return true;
    } catch (error) {
      console.error('❌ [LocalStorage] Failed to clear all data:', error);
      return false;
    }
  }
};

export default LocalStorageService; 