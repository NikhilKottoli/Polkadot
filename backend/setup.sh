#!/bin/bash

# Backend Setup Script for Rust Contract Development
# Installs polkatool, Foundry (cast), and sets up Rust toolchain

echo "🚀 Setting up backend for Rust contract development..."

# Create necessary directories
mkdir -p rust_contracts
mkdir -p compiled_contracts
mkdir -p deployed_contracts

echo "📦 Installing Rust toolchain..."
# Install Rust if not already installed
if ! command -v rustc &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
fi

# Install specific nightly toolchain for pallet-revive
rustup toolchain install nightly-2024-01-01
rustup component add rust-src --toolchain nightly-2024-01-01
rustup target add riscv32im-unknown-none-elf --toolchain nightly-2024-01-01

echo "🔧 Installing polkatool..."
# Install polkatool for PolkaVM compilation
cargo install polkatool

echo "⚒️ Installing Foundry (cast)..."
# Install Foundry which includes cast
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup

echo "🔑 Setting up wallet..."
# Import the development wallet
cast wallet import dev-account --private-key 5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133

echo "🌐 Setting up environment variables..."
# Create .env file with RPC URL
cat > .env << EOF
ETH_RPC_URL=https://westend-asset-hub-eth-rpc.polkadot.io
ETH_FROM=0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac
ACCOUNT_NAME=dev-account
EOF

echo "📋 Installing additional dependencies..."
# Install xxd for hex conversion (usually comes with vim)
if ! command -v xxd &> /dev/null; then
    echo "Installing xxd..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y xxd
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install xxd
    fi
fi

# Install jq for JSON parsing
if ! command -v jq &> /dev/null; then
    echo "Installing jq..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y jq
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    fi
fi

echo "🧪 Testing installation..."
# Test all tools
echo "Testing Rust..."
rustc --version

echo "Testing polkatool..."
polkatool --version

echo "Testing cast..."
cast --version

echo "Testing xxd..."
xxd -v

echo "Testing jq..."
jq --version

echo "✅ Backend setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure you have tokens in your wallet: 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac"
echo "2. Get tokens from the faucet: https://contracts.polkadot.io/connect-to-asset-hub"
echo "3. Run 'source ~/.cargo/env' to update your PATH"
echo ""
echo "🔧 Available commands:"
echo "- cargo build --release (build Rust contract)"
echo "- polkatool link <elf-file> -o contract.polkavm (link to PolkaVM)"
echo "- cast send --account dev-account --create \"\$(xxd -p -c 99999 contract.polkavm)\" (deploy)"
echo "- cast estimate <address> \"function_signature\" <params> (estimate gas)"
echo "- cast call <address> \"function_signature\" <params> (call function)" 