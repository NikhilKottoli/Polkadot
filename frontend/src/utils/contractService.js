/**
 * Compiles a Solidity contract using the backend service.
 * @param {string} code The Solidity code to compile.
 * @param {string} contractName The name of the contract.
 * @returns {Promise<{success: boolean, bytecode: string, abi: Array<any>, error?: string}>}
 */
export const compileContract = async (code, contractName) => {
  console.log('⚙️ [ContractService] Starting compilation');
  try {
    const res = await fetch('http://localhost:3000/api/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, contractName })
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('✅ [ContractService] Compilation successful');
      return {
        success: true,
        bytecode: data.bytecode,
        abi: Array.isArray(data.abi) ? data.abi : []
      };
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error('❌ [ContractService] Compilation failed:', err);
    return { success: false, error: `Compilation failed: ${err.message}` };
  }
};

/**
 * Deploys a compiled contract using the backend service.
 * @param {Array<any>} abi The ABI of the contract.
 * @param {string} bytecode The compiled bytecode of the contract.
 * @param {string} deployerAddress The address of the deployer.
 * @returns {Promise<{success: boolean, contractAddress?: string, transactionHash?: string, error?: string}>}
 */
export const deployContract = async (abi, bytecode, deployerAddress) => {
  console.log(`🚀 [ContractService] Starting deployment via backend API`);
  try {
    const res = await fetch('http://localhost:3000/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bytecode, abi, deployerAddress })
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('✅ [ContractService] Deployment successful');
      return {
        success: true,
        contractAddress: data.contractAddress,
        transactionHash: data.transactionHash
      };
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error('❌ [ContractService] Deployment failed:', err);
    return { success: false, error: `Deployment failed: ${err.message}` };
  }
}; 