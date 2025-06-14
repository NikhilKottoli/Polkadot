export const RustContractService = {
  generateRustContract(functionName, functionCode, contractName) {
    const rustTemplate = `#![no_main]
#![no_std]

use uapi::{HostFn, HostFnImpl as api, ReturnFlags};

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    // Safety: The unimp instruction is guaranteed to trap
    unsafe {
        core::arch::asm!("unimp");
        core::hint::unreachable_unchecked();
    }
}

/// This is the constructor which is called once per contract.
#[no_mangle]
#[polkavm_derive::polkavm_export]
pub extern "C" fn deploy() {}

/// This is the regular entry point when the contract is called.
#[no_mangle]
#[polkavm_derive::polkavm_export]
pub extern "C" fn call() {
    // ABI for ${functionName}
    let mut input = [0u8; 4];
    api::call_data_copy(&mut input, 32);
    
    let n = u32::from_be_bytes(input);
    let result = ${functionName}(n);
    
    // pad the result to 32 byte
    let mut output = [0u8; 32];
    output[28..].copy_from_slice(&result.to_be_bytes());
    
    api::return_value(ReturnFlags::empty(), &output);
}

${RustContractService.convertSolidityToRust(functionCode, functionName)}`;

    return rustTemplate;
  },

  convertSolidityToRust(functionCode, functionName) {
    // Basic conversion - this is simplified and would need more sophisticated parsing
    // For now, we'll create a template for common patterns
    
    if (functionName.includes('fibonacci')) {
      return `fn fibonacci(n: u32) -> u32 {
    if n == 0 {
        0
    } else if n == 1 {
        1
    } else {
        fibonacci(n - 1) + fibonacci(n - 2)
    }
}`;
    }
    
    // Default template for other functions
    return `fn ${functionName}(n: u32) -> u32 {
    // TODO: Implement optimized version of ${functionName}
    // This is a placeholder - implement based on your Solidity function
    n
}`;
  },

  generateModifiedSolidityContract(originalSolidity, highGasFunctions, rustContractAddress) {
    // Generate interface for rust contract
    const rustInterface = `
interface IRustContract {
    ${highGasFunctions.map(func => `function ${func.name}(uint32) external pure returns (uint32);`).join('\n    ')}
}`;

    // Modify the original contract to use rust functions
    let modifiedSolidity = originalSolidity;
    
    // Add the interface at the top
    modifiedSolidity = rustInterface + '\n\n' + modifiedSolidity;
    
    // Replace high gas functions with rust calls
    highGasFunctions.forEach(func => {
      const rustFunctionCall = `
    function ${func.name}Rust(uint32 n, IRustContract rustLib) external pure returns (uint32) {
        try rustLib.${func.name}(n) returns (uint32 result) {
            return result;
        } catch (bytes memory) {
            revert("calling into rust failed");
        }
    }`;
      
      // Add the rust version alongside the original
      modifiedSolidity = modifiedSolidity.replace(
        new RegExp(`(function ${func.name}[^}]+})`),
        `$1\n${rustFunctionCall}`
      );
    });
    
    return modifiedSolidity;
  },

  generateCargoToml(contractName) {
    return `[package]
name = "${contractName.toLowerCase()}_rust"
version = "0.1.0"
edition = "2021"

[dependencies]
uapi = { path = "../uapi" }
polkavm-derive = "0.4"

[lib]
crate-type = ["cdylib"]

[[bin]]
name = "main"
path = "src/main.rs"`;
  },

  generateMakefile(contractName) {
    return `# Make sure to have the latest polkatool installed
# cargo install polkatool

build:
\tcargo build --release
\tpolkatool link target/polkavm/release/${contractName.toLowerCase()}_rust.polkavm -o contract.polkavm

clean:
\tcargo clean
\trm -f contract.polkavm

.PHONY: build clean`;
  }
}; 