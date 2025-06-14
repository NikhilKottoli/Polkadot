import { estimateContractGas } from '../pages/Playground/components/LayoutComponents/gasEstimation';

export const GasEstimationService = {
  async estimateGas(solidityCode, contractName) {
    try {
      console.log("⛽ [GasEstimationService] Starting gas estimation");
      const gasEstimation = await estimateContractGas(solidityCode, contractName);
      console.log("⛽ [GasEstimationService] Gas estimation completed:", gasEstimation);
      return gasEstimation;
    } catch (gasError) {
      console.error("Gas estimation failed:", gasError);
      return {
        deploymentGas: null,
        functionGasEstimates: {},
        error: gasError.message || "Gas estimation failed"
      };
    }
  },

  identifyHighGasFunctions(gasEstimation, threshold = 100000) {
    if (!gasEstimation?.functionGasEstimates) return [];
    
    return Object.entries(gasEstimation.functionGasEstimates)
      .filter(([funcName, gasData]) => gasData.estimated > threshold)
      .map(([funcName, gasData]) => ({
        name: funcName,
        gas: gasData.estimated,
        needsRustOptimization: true
      }));
  }
}; 