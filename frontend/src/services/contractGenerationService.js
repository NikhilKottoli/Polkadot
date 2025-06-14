import { generateSolidityFromFlowchart } from '../utils/solidityGenerator';
import { generateSolidityFromFlowchartAI } from '../utils/aiService';
import { GasEstimationService } from './gasEstimationService';
import { RustContractService } from './rustContractService';
import { AIRustGenerationService } from './aiRustGenerationService';

export const ContractGenerationService = {
  async generateContract(nodes, edges, contractName, generationType = 'our-algorithm') {
    console.log("🔨 [ContractGenerationService] Starting contract generation");
    
    if (nodes.length === 0) {
      throw new Error("Cannot generate code from an empty flowchart.");
    }

    let solidityCode = "";
    
    if (generationType === "our-algorithm") {
      solidityCode = generateSolidityFromFlowchart(nodes, edges, contractName);
    } else {
      const result = await generateSolidityFromFlowchartAI(nodes, edges, contractName);
      if (result.success) {
        solidityCode = result.contractCode;
      } else {
        throw new Error(`AI generation failed: ${result.error}`);
      }
    }

    // Perform gas estimation
    const gasEstimation = await GasEstimationService.estimateGas(solidityCode, contractName);
    
    // Identify high gas functions
    const highGasFunctions = GasEstimationService.identifyHighGasFunctions(gasEstimation);
    
    return {
      original: {
        solidity: solidityCode,
        gasEstimation,
        highGasFunctions
      },
      optimized: highGasFunctions.length > 0 ? await ContractGenerationService.generateOptimizedContracts(solidityCode, highGasFunctions, contractName) : null
    };
  },

  async generateOptimizedContracts(originalSolidity, highGasFunctions, contractName) {
    // Use AI to generate optimized Rust code
    const aiResult = await AIRustGenerationService.generateRustFromSolidityFunctions(
      highGasFunctions, 
      originalSolidity, 
      contractName
    );

    let rustContracts;
    if (aiResult.success) {
      rustContracts = aiResult.functions.map((func, index) => ({
        name: `${contractName}_${func.name}_rust`,
        code: func.rustCode,
        estimatedGasSavings: func.estimatedGasSavings,
        optimizations: func.optimizations,
        cargoToml: RustContractService.generateCargoToml(`${contractName}_${func.name}`),
        makefile: RustContractService.generateMakefile(`${contractName}_${func.name}`)
      }));
    } else {
      // Fallback to basic generation
      rustContracts = (aiResult.fallback || highGasFunctions).map(func => ({
        name: `${contractName}_${func.name}_rust`,
        code: RustContractService.generateRustContract(func.name, '', contractName),
        estimatedGasSavings: "30%",
        optimizations: "Basic template optimization",
        cargoToml: RustContractService.generateCargoToml(`${contractName}_${func.name}`),
        makefile: RustContractService.generateMakefile(`${contractName}_${func.name}`)
      }));
    }

    const modifiedSolidity = this.generateOptimizedSolidity(
      originalSolidity, 
      highGasFunctions, 
      contractName
    );

    return {
      rustContracts,
      modifiedSolidity,
      highGasFunctions,
      aiGenerated: aiResult.success,
      totalEstimatedSavings: this.calculateTotalSavings(rustContracts)
    };
  },

  generateOptimizedSolidity(originalSolidity, highGasFunctions, contractName) {
    // Generate enhanced Solidity contract that integrates with Rust
    const rustInterface = `
interface IRustContract {
    ${highGasFunctions.map(func => `function ${func.name}(uint32) external pure returns (uint32);`).join('\n    ')}
}`;

    const rustIntegration = `
contract ${contractName}Optimized {
    address constant RUST_CONTRACT = address(0x0000000000000000000000000000000000000000);
    
    ${highGasFunctions.map(func => `
    function ${func.name}(uint32 n) public pure returns (uint32) {
        // Original implementation (kept for fallback)
        ${this.extractFunctionBody(originalSolidity, func.name)}
    }
    
    function ${func.name}Optimized(uint32 n) public pure returns (uint32) {
        if (RUST_CONTRACT == address(0)) {
            return ${func.name}(n); // Fallback to original
        }
        
        try IRustContract(RUST_CONTRACT).${func.name}(n) returns (uint32 result) {
            return result;
        } catch (bytes memory) {
            return ${func.name}(n); // Fallback on error
        }
    }`).join('\n')}
    
    // Add other contract functions here
}`;

    return rustInterface + '\n\n' + rustIntegration;
  },

  extractFunctionBody(solidityCode, functionName) {
    const functionRegex = new RegExp(`function\\s+${functionName}[^{]*{([^}]*)}`, 'g');
    const match = solidityCode.match(functionRegex);
    if (match) {
      // Extract just the function body without the function declaration
      const fullMatch = match[0];
      const bodyStart = fullMatch.indexOf('{') + 1;
      const bodyEnd = fullMatch.lastIndexOf('}');
      return fullMatch.substring(bodyStart, bodyEnd).trim();
    }
    return `// TODO: Implement ${functionName}`;
  },

  calculateTotalSavings(rustContracts) {
    const totalSavings = rustContracts.reduce((sum, contract) => {
      const savings = parseInt(contract.estimatedGasSavings.replace('%', '')) || 0;
      return sum + savings;
    }, 0);
    return Math.round(totalSavings / rustContracts.length);
  }
}; 