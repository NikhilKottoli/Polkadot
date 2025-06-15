# Define the RPC URL (default to http://localhost:8545)
export ETH_RPC_URL="https://testnet-passet-hub-eth-rpc.polkadot.io"
# Define the account that will use to call and deploy the contract
# Make sure to fund the account with some tokens (e.g. using the faucet https://contracts.polkadot.io/connect-to-asset-hub)
export ETH_FROM=0x8a84E3d8Fa00075FfA69010949dA38f63b7F5fB8
cast wallet import rust-deployer-account --private-key fd764dc29df5a5350345a449ba730e9bd17f39012bb0148304081606fcee2811

# Deploy the contract
cast send --account rust-deployer-account --create "$(xxd -p -c 99999 contract.polkavm)"

# output
# ...
# contractAddress      0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3
# ...

# or to get the address

set RUST_ADDRESS $(cast send --account rust-deployer-account --create "$(xxd -p -c 99999 contract.polkavm)" --json | jq -r .contractAddress)

# Call the contract
cast call $RUST_ADDRESS "optimised_contract(uint32) public pure returns (uint32)" "4"


# # Build the solidity contract
# npx @parity/revive@latest --bin call_from_sol.sol

# # Deploy the solidity contract
# SOL_ADDRESS=$(cast send --account rust-deployer-account --create "$(xxd -p -c 99999 call_from_sol_sol_CallRust.polkavm)" --json | jq -r .contractAddress)

# # Compare the gas estimates
# cast estimate $RUST_ADDRESS "optimised_contract(uint32) public pure returns (uint32)" 4
# cast estimate $SOL_ADDRESS "optimised_contract(uint32) public pure returns (uint32)" 4

# # Call the rust contract from solidity
# cast call $SOL_ADDRESS "optimised_contract(uint32, address) external pure returns (uint32)" 4 $RUST_ADDRESS