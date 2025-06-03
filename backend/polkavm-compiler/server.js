const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/compile', (req, res) => {
  console.log('Received /api/compile request');
  const solidityCode = req.body.code;
  console.log('Writing Contract.sol...');
  fs.writeFileSync('Contract.sol', solidityCode);

  try {
    // 1. Compile bytecode with resolc and capture stdout
    console.log('Compiling bytecode with resolc...');
    const bytecode = execSync('C:\\polkavm-tools\\resolc.exe --bin Contract.sol', { encoding: 'utf8' });
    fs.writeFileSync('Contract_polkavm.bin', bytecode);
    console.log('Bytecode compilation done.', bytecode);

    // 2. Generate ABI with solc
    console.log('Generating ABI with solc...');
    // For ABI
    const abi = execSync('C:\\polkavm-tools\\solc.exe --abi Contract.sol', { encoding: 'utf8' });
    fs.writeFileSync('Contract.abi', abi);
    console.log('ABI generation done.');

    // 3. Read outputs
    console.log('Reading Contract_polkavm.bin...');
    const bytecodeFile = fs.readFileSync('Contract_polkavm.bin', 'utf8');
    console.log('Reading Contract.abi...');
    // const abi = fs.readFileSync('Contract.abi', 'utf8');

    console.log('Compilation successful, sending response.');
    res.json({ success: true, bytecode: bytecodeFile, abi });
  } catch (err) {
    console.error('Error during compilation:', err.message);
    ['_polkavm.bin', '.abi'].forEach(ext => {
      const file = `Contract${ext}`;
      if (fs.existsSync(file)) {
        console.log(`Deleting ${file} due to error.`);
        fs.unlinkSync(file);
      }
    });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
