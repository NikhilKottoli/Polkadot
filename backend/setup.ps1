# Backend Setup Script for Windows (PowerShell)
# Installs polkatool, Foundry (cast), and sets up Rust toolchain

Write-Host "Setting up backend for Rust contract development on Windows..." -ForegroundColor Green

# Create necessary directories
Write-Host "Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "rust_contracts" | Out-Null
New-Item -ItemType Directory -Force -Path "compiled_contracts" | Out-Null
New-Item -ItemType Directory -Force -Path "deployed_contracts" | Out-Null

Write-Host "Installing Rust toolchain..." -ForegroundColor Yellow
# Check if Rust is installed
if (!(Get-Command "rustc" -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Rust..." -ForegroundColor Cyan
    # Download and install Rust
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "rustup-init.exe"
    .\rustup-init.exe -y --default-toolchain stable
    Remove-Item "rustup-init.exe"
    
    # Add Rust to PATH for current session
    $env:PATH += ";$env:USERPROFILE\.cargo\bin"
} else {
    Write-Host "Rust already installed" -ForegroundColor Green
}

# Install specific nightly toolchain for pallet-revive
Write-Host "Installing nightly toolchain..." -ForegroundColor Cyan
rustup toolchain install nightly-2024-01-01
rustup component add rust-src --toolchain nightly-2024-01-01
rustup target add riscv32im-unknown-none-elf --toolchain nightly-2024-01-01

Write-Host "Installing polkatool..." -ForegroundColor Yellow
# Install polkatool for PolkaVM compilation
cargo install polkatool

Write-Host "Installing Foundry (cast)..." -ForegroundColor Yellow
# Install Foundry which includes cast
if (!(Get-Command "cast" -ErrorAction SilentlyContinue)) {
    Write-Host "Downloading Foundry..." -ForegroundColor Cyan
    # Download foundryup for Windows
    Invoke-WebRequest -Uri "https://github.com/foundry-rs/foundry/releases/latest/download/foundry_nightly_windows_amd64.tar.gz" -OutFile "foundry.tar.gz"
    
    # Extract foundry (requires 7-zip or similar)
    if (Get-Command "7z" -ErrorAction SilentlyContinue) {
        7z x foundry.tar.gz
        7z x foundry.tar
        Move-Item "cast.exe" "$env:USERPROFILE\.cargo\bin\"
        Move-Item "forge.exe" "$env:USERPROFILE\.cargo\bin\"
        Move-Item "anvil.exe" "$env:USERPROFILE\.cargo\bin\"
        Remove-Item "foundry.tar.gz", "foundry.tar" -Force
    } else {
        Write-Host "Please install 7-zip and run this script again, or manually download Foundry from https://github.com/foundry-rs/foundry/releases" -ForegroundColor Red
    }
} else {
    Write-Host "Foundry already installed" -ForegroundColor Green
}

Write-Host "Setting up wallet..." -ForegroundColor Yellow
# Import the development wallet
try {
    cast wallet import dev-account --private-key 5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133
    Write-Host "Wallet imported successfully" -ForegroundColor Green
} catch {
    Write-Host "Wallet import failed or already exists" -ForegroundColor Yellow
}

Write-Host "Setting up environment variables..." -ForegroundColor Yellow
# Create .env file with RPC URL
$envContent = @"
ETH_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io
ETH_FROM=0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac
ACCOUNT_NAME=dev-account
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Testing installation..." -ForegroundColor Yellow
# Test all tools
Write-Host "Testing Rust..." -ForegroundColor Cyan
try {
    rustc --version
    Write-Host "Rust OK" -ForegroundColor Green
} catch {
    Write-Host "Rust failed" -ForegroundColor Red
}

Write-Host "Testing polkatool..." -ForegroundColor Cyan
try {
    polkatool --version
    Write-Host "polkatool OK" -ForegroundColor Green
} catch {
    Write-Host "polkatool failed" -ForegroundColor Red
}

Write-Host "Testing cast..." -ForegroundColor Cyan
try {
    cast --version
    Write-Host "cast OK" -ForegroundColor Green
} catch {
    Write-Host "cast failed" -ForegroundColor Red
}

Write-Host "Backend setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure you have tokens in your wallet: 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac"
Write-Host "2. Get tokens from the faucet: https://contracts.polkadot.io/connect-to-asset-hub"
Write-Host "3. Restart your terminal or run: `$env:PATH += `";`$env:USERPROFILE\.cargo\bin`""
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "- cargo build --release (build Rust contract)"
Write-Host "- polkatool link target\riscv32im-unknown-none-elf\release\contract -o contract.polkavm"
Write-Host "- cast send --account dev-account --create `"hex_data`" (deploy)"
Write-Host "- cast estimate address `"function_signature`" params (estimate gas)"
Write-Host "- cast call address `"function_signature`" params (call function)"

Write-Host ""
Write-Host "Note: If you don't have 7-zip installed, please:" -ForegroundColor Yellow
Write-Host "1. Install 7-zip from https://www.7-zip.org/"
Write-Host "2. Or manually download Foundry from https://github.com/foundry-rs/foundry/releases"
Write-Host "3. Extract cast.exe, forge.exe, anvil.exe to your PATH" 