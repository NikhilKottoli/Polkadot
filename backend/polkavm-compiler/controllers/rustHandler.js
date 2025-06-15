const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

async function compileRust(code) {
  try {
    // Ensure the directory exists
    const dirPath = path.join(__dirname, "../rust-contract-compiler");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, "src/main.rs");

    // Delete file content if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Write the template code first
    const templateCode = `
#![no_main]
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
    // We want this contract to be called with the following ABI:
    // function fibonacci(uint32) external pure returns (uint32);

    // ❯ cast calldata "fibonnaci(uint) view returns(uint)" "42" | xxd -r -p | xxd -c 32 -g 1
    //00000000: 50 7a 10 34 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
    //00000020: 00 00 00 2a

    // The input is abi encoded as follows:
    // - 4 byte selector
    // - 32 byte padded integer

    // the actual 4 byte integer is stored at offset 32
    let mut input = [0u8; 4];
    api::call_data_copy(&mut input, 32);

    // Note for more complex input, sol! macro can be used to encod and decode input and output
    // https://docs.rs/alloy-core/0.8.24/alloy_core/sol_types/macro.sol.html
    let n = u32::from_be_bytes(input);
    let result = optimised_contract(n);

    // pad the result to 32 byte
    let mut output = [0u8; 32];
    output[28..].copy_from_slice(&result.to_be_bytes());

    // returning without calling this function leaves the output buffer empty
    api::return_value(ReturnFlags::empty(), &output);
}`;

    // Write template code first
    fs.writeFileSync(filePath, templateCode);

    // Then append the user's code
    fs.appendFileSync(filePath, code);

    return {
      message: "Rust code saved successfully",
      path: filePath,
    };
  } catch (error) {
    throw new Error(`Failed to save Rust code: ${error.message}`);
  }
}

async function runMake() {
  try {
    const { stdout, stderr } = await execPromise("make", {
      cwd: path.resolve(__dirname, "../rust-contract-compiler"),
      shell: "/bin/bash",
    });

    if (stderr) {
      console.log("Make stderr:", stderr);
    }

    return {
      message: "Make command executed successfully",
      output: stdout,
    };
  } catch (error) {
    console.error("Make error:", error);
    throw new Error(`Failed to run make command: ${error.message}`);
  }
}

async function deployPolkaVM(req, res) {
  console.log("Deploying PolkaVM contract...");
  try {
    // Set environment variables
    process.env.ETH_RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
    process.env.ETH_FROM = "0x8a84E3d8Fa00075FfA69010949dA38f63b7F5fB8";

    // Deploy the contract and get the address
    const deployCommand = `cast send --account rust-deployer-account --password "123" --create "$(xxd -p -c 99999 contract.polkavm)" --json`;
    const { stdout: deployStdout } = await execPromise(deployCommand, {
      cwd: path.resolve(__dirname, "../rust-contract-compiler"),
      shell: "/bin/bash",
    });

    // Parse the JSON output to get the contract address
    const deployResult = JSON.parse(deployStdout);
    const rustAddress = deployResult.contractAddress;

    res.json({
      success: true,
      contractAddress: rustAddress,
      message: "PolkaVM contract deployed successfully",
    });
  } catch (err) {
    console.error("Deployment error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      message:
        "Failed to deploy PolkaVM contract. Please check your code syntax and try again.",
    });
  }
}

async function handleRustCode(req, res) {
  const { code } = req.body;
  console.log("Compiling Rust code...");
  try {
    // First compile the Rust code
    const result = await compileRust(code);

    if (!result) {
      return res.status(500).json({
        success: false,
        error: "Failed to compile Rust code",
        message: "Please check your code syntax and try again.",
      });
    }

    // Then run make
    const makeResult = await runMake();

    // Finally deploy the contract
    await deployPolkaVM(req, res);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      message:
        "Failed to process Rust code. Please check your code syntax and try again.",
    });
  }
}

module.exports = { handleRustCode };
