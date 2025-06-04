const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { execSync } = require('child_process');
const ethers = require('ethers');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure Polkadot AssetHub connection
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const PRIVATE_KEY = "fd764dc29df5a5350345a449ba730e9bd17f39012bb0148304081606fcee2811";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

app.post('/api/compile', (req, res) => {
  console.log('Received /api/compile request');
  const solidityCode = req.body.code;
  fs.writeFileSync('Contract.sol', solidityCode);

  try {
    // 1. Compile bytecode with resolc and capture output
    console.log('Compiling bytecode...');
    const resolcOutput = execSync('C:\\polkavm-tools\\resolc.exe --bin Contract.sol', { encoding: 'utf8' });

    // Extract only the hex part of the bytecode (after "bytecode: ")
    // Example resolc output: "Contract `Contract.sol:SimpleStorage` bytecode: 0x1234abcd..."
    const bytecodeMatch = resolcOutput.match(/0x[0-9a-fA-F]+/);
    if (!bytecodeMatch) throw new Error('Bytecode not found in resolc output');
    const bytecode = bytecodeMatch[0];

    // 2. Generate ABI with solc and extract JSON
    console.log('Generating ABI...');
    const abiOutput = execSync('C:\\polkavm-tools\\solc.exe --abi Contract.sol', { encoding: 'utf8' });
    const abiMatch = abiOutput.match(/\[.*\]/s);
    if (!abiMatch) throw new Error('ABI not found in solc output');
    const abi = JSON.parse(abiMatch[0]);

    // 3. Cleanup temp file
    fs.unlinkSync('Contract.sol');

    console.log('Compilation successful');
    res.json({ success: true, bytecode, abi });

  } catch (err) {
    console.error('Compilation error:', err.message);
    // Cleanup any partial files
    if (fs.existsSync('Contract.sol')) fs.unlinkSync('Contract.sol');
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/deploy', async (req, res) => {
  const { bytecode, abi } = req.body;

  try {
    console.log('Deploying contract...');
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    res.json({
      success: true,
      contractAddress: contract.target,
      transactionHash: contract.deploymentTransaction().hash
    });
  } catch (err) {
    console.error('Deployment failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
