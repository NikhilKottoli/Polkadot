import { API_CONFIG, makeAPIRequest } from '../config/apiConfig';

export const GeminiService = {
  async generateSolidityContract(flowchartData, contractName) {
    try {
      console.log("🤖 [Gemini] Generating Solidity contract from flowchart:", contractName);
      
      const prompt = this.createSolidityGenerationPrompt(flowchartData, contractName);
      
      const response = await this.callGeminiAPI(prompt);
      
      if (!response.success) {
        throw new Error(`Gemini API failed: ${response.error}`);
      }
      
      const solidityCode = this.extractSolidityFromResponse(response.text);
      
      return {
        success: true,
        solidity: solidityCode,
        aiGenerated: true,
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error("❌ [Gemini] Solidity generation failed:", error);
      return {
        success: false,
        error: error.message,
        aiGenerated: false
      };
    }
  },

  async optimizeFunctionToRust(functionCode, functionName, gasEstimate) {
    try {
      console.log("🦀 [Gemini] Optimizing function to Rust:", functionName);
      
      const prompt = this.createRustOptimizationPrompt(functionCode, functionName, gasEstimate);
      
      const response = await this.callGeminiAPI(prompt);
      
      if (!response.success) {
        throw new Error(`Gemini API failed: ${response.error}`);
      }
      
      const rustOptimization = this.parseRustOptimizationResponse(response.text, functionName);
      
      return {
        success: true,
        rustCode: rustOptimization.code,
        optimizations: rustOptimization.optimizations,
        estimatedGasSavings: rustOptimization.estimatedSavings,
        cargoToml: rustOptimization.cargoToml,
        aiGenerated: true,
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error("❌ [Gemini] Rust optimization failed:", error);
      return {
        success: false,
        error: error.message,
        aiGenerated: false
      };
    }
  },

  async updateSolidityWithRustIntegration(originalSolidity, rustContracts, contractName) {
    try {
      console.log("🔄 [Gemini] Updating Solidity with Rust integration");
      
      const prompt = this.createSolidityUpdatePrompt(originalSolidity, rustContracts, contractName);
      
      const response = await this.callGeminiAPI(prompt);
      
      if (!response.success) {
        throw new Error(`Gemini API failed: ${response.error}`);
      }
      
      const updatedSolidity = this.extractSolidityFromResponse(response.text);
      
      return {
        success: true,
        modifiedSolidity: updatedSolidity,
        aiGenerated: true,
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error("❌ [Gemini] Solidity update failed:", error);
      return {
        success: false,
        error: error.message,
        aiGenerated: false
      };
    }
  },

  async callGeminiAPI(prompt) {
    try {
      const url = `${API_CONFIG.GEMINI.BASE_URL}/models/${API_CONFIG.GEMINI.MODEL}:generateContent?key=${API_CONFIG.GEMINI.API_KEY}`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      };
      
      const response = await makeAPIRequest(url, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      if (response.candidates && response.candidates[0]) {
        return {
          success: true,
          text: response.candidates[0].content.parts[0].text
        };
      } else {
        throw new Error('No response from Gemini API');
      }
      
    } catch (error) {
      console.error("❌ [Gemini] API call failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  createSolidityGenerationPrompt(flowchartData, contractName) {
    return `
You are an expert Solidity developer. Generate a complete, production-ready Solidity smart contract based on the following flowchart data.

Contract Name: ${contractName}
Flowchart Data: ${JSON.stringify(flowchartData, null, 2)}

Requirements:
1. Generate complete Solidity code with proper SPDX license and pragma
2. Include all necessary imports and interfaces
3. Implement proper access control and security measures
4. Add comprehensive error handling
5. Include events for important state changes
6. Follow Solidity best practices and gas optimization
7. Make functions payable where appropriate
8. Include proper documentation comments

Please provide ONLY the Solidity code, wrapped in \`\`\`solidity code blocks.

Example structure:
- State variables
- Events
- Modifiers
- Constructor
- Functions (based on flowchart logic)
- Helper functions

Focus on creating efficient, secure, and well-documented code.
`;
  },

  createRustOptimizationPrompt(functionCode, functionName, gasEstimate) {
    return `
You are an expert Rust developer specializing in blockchain optimization. Convert the following Solidity function to an optimized Rust implementation for Polkadot/Substrate.

Function Name: ${functionName}
Current Gas Estimate: ${gasEstimate} gas
Solidity Code:
\`\`\`solidity
${functionCode}
\`\`\`

Requirements:
1. Convert to Rust using ink! framework for Polkadot
2. Optimize for gas efficiency (aim for 60-80% reduction)
3. Use Rust's memory safety and performance features
4. Implement proper error handling with Result types
5. Add comprehensive tests
6. Include Cargo.toml configuration
7. Use appropriate data structures (Vec, HashMap, etc.)
8. Implement the same business logic but more efficiently

Please provide:
1. Complete Rust contract code
2. Cargo.toml file
3. Explanation of optimizations made
4. Estimated gas savings percentage
5. Key performance improvements

Format your response as:
RUST_CODE:
\`\`\`rust
[rust code here]
\`\`\`

CARGO_TOML:
\`\`\`toml
[cargo.toml here]
\`\`\`

OPTIMIZATIONS:
[detailed explanation of optimizations]

ESTIMATED_SAVINGS:
[percentage savings estimate]
`;
  },

  createSolidityUpdatePrompt(originalSolidity, rustContracts, contractName) {
    return `
You are an expert Solidity developer. Update the following Solidity contract to integrate with the provided Rust contracts for gas optimization.

Original Contract:
\`\`\`solidity
${originalSolidity}
\`\`\`

Rust Contracts to integrate:
${rustContracts.map(rust => `
Function: ${rust.functionName}
Rust Contract: ${rust.name}
Optimizations: ${rust.optimizations}
`).join('\n')}

Requirements:
1. Create a hybrid contract that uses Rust contracts for expensive operations
2. Add interfaces to call Rust contracts
3. Implement fallback mechanisms for safety
4. Add functions to update Rust contract addresses (onlyOwner)
5. Preserve original functionality as backup
6. Add proper error handling for cross-contract calls
7. Include events for Rust contract interactions
8. Maintain backward compatibility

The updated contract should:
- Call Rust contracts for optimized functions when available
- Fall back to original Solidity implementation if Rust calls fail
- Allow owner to update Rust contract addresses
- Emit events for gas savings tracking

Please provide ONLY the updated Solidity code, wrapped in \`\`\`solidity code blocks.
`;
  },

  extractSolidityFromResponse(responseText) {
    const solidityMatch = responseText.match(/```solidity\n([\s\S]*?)\n```/);
    if (solidityMatch) {
      return solidityMatch[1].trim();
    }
    
    const contractMatch = responseText.match(/contract\s+\w+[\s\S]*?}/);
    if (contractMatch) {
      return contractMatch[0];
    }
    
    return responseText.trim();
  },

  parseRustOptimizationResponse(responseText, functionName) {
    const result = {
      code: '',
      optimizations: '',
      estimatedSavings: '60-70%',
      cargoToml: ''
    };
    
    const rustMatch = responseText.match(/RUST_CODE:\s*```rust\n([\s\S]*?)\n```/);
    if (rustMatch) {
      result.code = rustMatch[1].trim();
    } else {
      const codeMatch = responseText.match(/```rust\n([\s\S]*?)\n```/);
      if (codeMatch) {
        result.code = codeMatch[1].trim();
      }
    }
    
    const cargoMatch = responseText.match(/CARGO_TOML:\s*```toml\n([\s\S]*?)\n```/);
    if (cargoMatch) {
      result.cargoToml = cargoMatch[1].trim();
    } else {
      result.cargoToml = `[package]
name = "${functionName.toLowerCase()}_optimized"
version = "0.1.0"
edition = "2021"

[dependencies]
ink = { version = "4.0", default-features = false }
scale = { package = "parity-scale-codec", version = "3", default-features = false, features = ["derive"] }
scale-info = { version = "2", default-features = false, features = ["derive"], optional = true }

[lib]
name = "${functionName.toLowerCase()}_optimized"
path = "lib.rs"
crate-type = ["cdylib"]

[features]
default = ["std"]
std = [
    "ink/std",
    "scale/std",
    "scale-info/std",
]
ink-as-dependency = []`;
    }
    
    const optimizationsMatch = responseText.match(/OPTIMIZATIONS:\s*([\s\S]*?)(?=ESTIMATED_SAVINGS:|$)/);
    if (optimizationsMatch) {
      result.optimizations = optimizationsMatch[1].trim();
    }
    
    const savingsMatch = responseText.match(/ESTIMATED_SAVINGS:\s*([\d\-\%\s]+)/);
    if (savingsMatch) {
      result.estimatedSavings = savingsMatch[1].trim();
    }
    
    return result;
  }
}; 