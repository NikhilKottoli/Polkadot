# Polkadot Contract Backend

This backend handles Rust and Solidity contract compilation and deployment using real tools.

## Setup

### Windows (PowerShell)
1. **Run the PowerShell setup script:**
   ```powershell
   .\setup.ps1
   ```

### Linux/macOS (Bash)
1. **Run the bash setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Install npm dependencies:**
   ```bash
   npm install
   ```

## Tools Installed

- **Rust toolchain** with nightly-2024-01-01
- **polkatool** for PolkaVM compilation and linking
- **Foundry (cast)** for contract deployment and interaction
- **@parity/revive** for Solidity to PolkaVM compilation
- **xxd** (Linux/macOS) for hex conversion
- **jq** for JSON parsing

## Directory Structure

```
backend/
├── rust_contracts/          # Rust contract source files
├── solidity_contracts/      # Solidity contract source files
├── compiled_contracts/      # Compiled .polkavm files
├── deployed_contracts/      # Deployment records
├── setup.sh                # Linux/macOS setup script
├── setup.ps1               # Windows PowerShell setup script
├── package.json            # npm dependencies
└── .env                    # Environment variables
```

## Usage

### Compile Rust Contract

#### Windows (PowerShell)
1. Create Rust project structure:
   ```powershell
   New-Item -ItemType Directory -Force -Path "rust_contracts\my_contract\src"
   Set-Location "rust_contracts\my_contract"
   ```

2. Build with cargo:
   ```powershell
   cargo build --release
   ```

3. Link with polkatool:
   ```powershell
   polkatool link target\riscv32ema-unknown-none-elf\release\my_contract -o contract.polkavm
   ```

#### Linux/macOS (Bash)
1. Create Rust project structure:
   ```bash
   mkdir -p rust_contracts/my_contract/src
   cd rust_contracts/my_contract
   ```

2. Build with cargo:
   ```bash
   cargo build --release
   ```

3. Link with polkatool:
   ```bash
   polkatool link target/riscv32ema-unknown-none-elf/release/my_contract -o contract.polkavm
   ```

### Compile Solidity Contract

#### Windows (PowerShell)
1. Compile with @parity/revive:
   ```powershell
   npx @parity/revive@latest --bin solidity_contracts\MyContract.sol
   ```

#### Linux/macOS (Bash)
1. Compile with @parity/revive:
   ```bash
   npx @parity/revive@latest --bin solidity_contracts/MyContract.sol
   ```

### Deploy Contracts

#### Windows (PowerShell)
1. Set environment variables:
   ```powershell
   $env:ETH_RPC_URL="https://testnet-passet-hub-eth-rpc.polkadot.io"
   ```

2. Deploy Rust contract:
   ```powershell
   $hexData = (Get-Content "contract.polkavm" -Raw -Encoding Byte | ForEach-Object { '{0:x2}' -f $_ }) -join ''
   $RUST_ADDRESS = (cast send --account dev-account --create "$hexData" --json | ConvertFrom-Json).contractAddress
   ```

3. Deploy Solidity contract:
   ```powershell
   $hexData = (Get-Content "MyContract_sol_MyContract.polkavm" -Raw -Encoding Byte | ForEach-Object { '{0:x2}' -f $_ }) -join ''
   $SOL_ADDRESS = (cast send --account dev-account --create "$hexData" --json | ConvertFrom-Json).contractAddress
   ```

#### Linux/macOS (Bash)
1. Set environment variables:
   ```bash
   export ETH_RPC_URL="https://testnet-passet-hub-eth-rpc.polkadot.io"
   ```

2. Deploy Rust contract:
   ```bash
   RUST_ADDRESS=$(cast send --account dev-account --create "$(xxd -p -c 99999 contract.polkavm)" --json | jq -r .contractAddress)
   ```

3. Deploy Solidity contract:
   ```bash
   SOL_ADDRESS=$(cast send --account dev-account --create "$(xxd -p -c 99999 MyContract_sol_MyContract.polkavm)" --json | jq -r .contractAddress)
   ```

### Interact with Contracts

#### Windows (PowerShell)
1. Call contract function:
   ```powershell
   cast call $RUST_ADDRESS "fibonacci(uint32) public pure returns (uint32)" "4"
   ```

2. Estimate gas:
   ```powershell
   cast estimate $RUST_ADDRESS "fibonacci(uint32) public pure returns (uint32)" 4
   ```

3. Compare gas usage:
   ```powershell
   cast estimate $RUST_ADDRESS "fibonacci(uint32) public pure returns (uint32)" 4
   cast estimate $SOL_ADDRESS "fibonacci(uint32) public pure returns (uint32)" 4
   ```

#### Linux/macOS (Bash)
1. Call contract function:
   ```bash
   cast call $RUST_ADDRESS "fibonacci(uint32) public pure returns (uint32)" "4"
   ```

2. Estimate gas:
   ```bash
   cast estimate $RUST_ADDRESS "fibonacci(uint32) public pure returns (uint32)" 4
   ```

3. Compare gas usage:
   ```bash
   cast estimate $RUST_ADDRESS "fibonacci(uint32) public pure returns (uint32)" 4
   cast estimate $SOL_ADDRESS "fibonacci(uint32) public pure returns (uint32)" 4
   ```

### Inspect Contracts

1. Get contract stats:
   ```bash
   polkatool stats contract.polkavm
   ```

2. Disassemble contract:
   ```bash
   polkatool disassemble contract.polkavm
   ```

## Environment Variables

- `ETH_RPC_URL`: RPC endpoint (default: https://testnet-passet-hub-eth-rpc.polkadot.io)
- `ETH_FROM`: Wallet address for transactions
- `ACCOUNT_NAME`: Cast wallet account name (default: dev-account)

## Wallet Setup

The setup script automatically imports a development wallet with the private key:
`5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133`

**Important:** Make sure to fund this wallet with tokens from the faucet:
https://contracts.polkadot.io/connect-to-asset-hub

## Troubleshooting

### Windows
1. **PowerShell execution policy:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Rust compilation fails:**
   - Ensure you have the correct nightly toolchain: `rustup toolchain install nightly-2024-01-01`
   - Add the target: `rustup target add riscv32ema-unknown-none-elf --toolchain nightly-2024-01-01`

3. **polkatool not found:**
   - Install polkatool: `cargo install polkatool`
   - Restart PowerShell or add to PATH: `$env:PATH += ";$env:USERPROFILE\.cargo\bin"`

4. **cast not found:**
   - Install 7-zip from https://www.7-zip.org/
   - Re-run the setup script: `.\setup.ps1`

### Linux/macOS
1. **Rust compilation fails:**
   - Ensure you have the correct nightly toolchain: `rustup toolchain install nightly-2024-01-01`
   - Add the target: `rustup target add riscv32ema-unknown-none-elf --toolchain nightly-2024-01-01`

2. **polkatool not found:**
   - Install polkatool: `cargo install polkatool`
   - Update PATH: `source ~/.cargo/env`

3. **cast not found:**
   - Install Foundry: `curl -L https://foundry.paradigm.xyz | bash && foundryup`

### General
4. **Deployment fails:**
   - Check wallet balance
   - Verify RPC URL is accessible
   - Ensure wallet is imported: `cast wallet list`

## Windows-Specific Notes

- Use PowerShell instead of Command Prompt for better compatibility
- File paths use backslashes (`\`) instead of forward slashes (`/`)
- Hex conversion uses PowerShell's `Get-Content` with byte encoding instead of `xxd`
- JSON parsing uses `ConvertFrom-Json` instead of `jq`
- Environment variables are set with `$env:VARIABLE_NAME` instead of `export` 