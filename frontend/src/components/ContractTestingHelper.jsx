import React from 'react';

const ContractTestingHelper = () => {
  return (
    <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-yellow-900 mb-4">🎯 Testing Your Asset Management Contract</h3>
      
      <div className="space-y-4 text-sm text-yellow-800">
        <div>
          <h4 className="font-medium mb-2">To test your deployed "Asset Management" contract:</h4>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li><strong>Get Contract Details:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Contract address from your deployment</li>
                <li>Contract ABI (from your compiled contract)</li>
                <li>Make sure you're on the correct network</li>
              </ul>
            </li>
            
            <li><strong>Add to Dashboard:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Click "Add Contract" button</li>
                <li>Fill in name: "Asset Management"</li>
                <li>Paste your contract address</li>
                <li>Paste your contract ABI</li>
                <li>Select the correct network</li>
              </ul>
            </li>
            
            <li><strong>Connect & Test:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Connect MetaMask to the same network</li>
                <li>Click the green "Test Contract" button</li>
                <li>Start with read functions (no gas cost)</li>
                <li>Test write functions (requires gas)</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-yellow-100 rounded p-3">
          <h4 className="font-medium mb-2">📋 Common Asset Management Functions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>
              <strong>Read Functions:</strong>
              <ul className="list-disc list-inside ml-2">
                <li>getAssets()</li>
                <li>getAssetBalance(address, tokenId)</li>
                <li>ownerOf(tokenId)</li>
                <li>totalSupply()</li>
              </ul>
            </div>
            <div>
              <strong>Write Functions:</strong>
              <ul className="list-disc list-inside ml-2">
                <li>createAsset(name, value)</li>
                <li>transferAsset(to, tokenId)</li>
                <li>updateAssetValue(tokenId, newValue)</li>
                <li>approve(spender, tokenId)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-100 rounded p-3">
          <h4 className="font-medium mb-2">💡 Troubleshooting Tips:</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Function not working?</strong> Check if you're connected to the right network</li>
            <li><strong>Transaction failing?</strong> Ensure you have enough gas and correct parameters</li>
            <li><strong>Demo contract errors?</strong> Demo uses mock address - expect errors for read functions</li>
            <li><strong>Need ABI?</strong> Copy from your compiled contract or Hardhat artifacts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContractTestingHelper; 