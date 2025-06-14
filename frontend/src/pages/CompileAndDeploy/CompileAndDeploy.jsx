import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDeployedContract } from '../../utils/deploymentIntegration';

export default function ContractDeployer() {
    const navigate = useNavigate();
    const [code, setCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract SimpleStorage {
  uint256 number;
  
  function store(uint256 _num) public {
    number = _num;
  }
  
  function retrieve() public view returns (uint256) {
    return number;
  }
}`)
    const [bytecode, setBytecode] = useState('')
    const [abi, setAbi] = useState('')
    const [deployed, setDeployed] = useState({})
    const [loading, setLoading] = useState({ compile: false, deploy: false })
    const [error, setError] = useState('')

    const handleCompile = async () => {
        setLoading({ ...loading, compile: true })
        setError('')
        try {
            const res = await fetch('http://localhost:3000/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            const data = await res.json()
            if (data.success) {
                setBytecode(data.bytecode)
                setAbi(data.abi)
            } else {
                throw new Error(data.error)
            }
        } catch (err) {
            setError(`Compilation failed: ${err.message}`)
        }
        setLoading({ ...loading, compile: false })
    }

    const handleDeploy = async () => {
        setLoading({ ...loading, deploy: true })
        setError('')
        try {
            const res = await fetch('http://localhost:3000/api/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bytecode, abi })
            })
            const data = await res.json()
            if (data.success) {
                setDeployed({
                    address: data.contractAddress,
                    txHash: data.transactionHash
                })

                // Auto-save to contract testing dashboard
                try {
                    const contractData = {
                        name: 'Manual Deployment',
                        address: data.contractAddress,
                        description: 'Deployed via manual compiler interface',
                        network: 'AssetHub',
                        abi: abi,
                        flowchartNodes: [],
                        deploymentTx: data.transactionHash,
                        deployedBy: 'User'
                    };
                    
                    addDeployedContract(contractData);
                } catch (autoSaveError) {
                    console.error('Auto-save to dashboard failed:', autoSaveError);
                }
            } else {
                throw new Error(data.error)
            }
        } catch (err) {
            setError(`Deployment failed: ${err.message}`)
        }
        setLoading({ ...loading, deploy: false })
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Polkadot Contract Deployer</h1>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-64 bg-gray-700 text-gray-100 p-4 rounded-md font-mono text-sm mb-4"
                        placeholder="Paste Solidity code here"
                    />

                    <div className="flex gap-4">
                        <button
                            onClick={handleCompile}
                            disabled={loading.compile}
                            className={`px-4 py-2 rounded-md ${loading.compile
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500'}`}
                        >
                            {loading.compile ? 'Compiling...' : 'Compile Contract'}
                        </button>

                        <button
                            onClick={handleDeploy}
                            disabled={!bytecode || loading.deploy}
                            className={`px-4 py-2 rounded-md ${!bytecode || loading.deploy
                                ? 'bg-green-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-500'}`}
                        >
                            {loading.deploy ? 'Deploying...' : 'Deploy Contract'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-800 text-red-100 p-4 rounded-md mb-6">
                        Error: {error}
                    </div>
                )}

                {bytecode && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Compilation Results</h2>
                        <div className="grid gap-4">
                            <div>
                                <h3 className="font-mono text-sm mb-2">Bytecode</h3>
                                <pre className="bg-gray-700 p-4 rounded-md overflow-x-auto text-xs">
                                    {bytecode.slice(0, 200)}... [truncated]
                                </pre>
                            </div>
                            <div>
                                <h3 className="font-mono text-sm mb-2">ABI</h3>
                                <pre className="bg-gray-700 p-4 rounded-md overflow-x-auto text-xs">
                                    {abi.map((item, index) => (
                                        <div key={index} className="mb-2 p-2 border rounded">
                                            <div><strong>Name:</strong> {item.name || '(no name)'}</div>
                                            <div><strong>Type:</strong> {item.type}</div>
                                            <div><strong>State Mutability:</strong> {item.stateMutability}</div>
                                            <div><strong>Inputs:</strong> {item.inputs && item.inputs.length > 0 ? (
                                                <ul>
                                                    {item.inputs.map((input, i) => (
                                                        <li key={i}>{input.name} : {input.type}</li>
                                                    ))}
                                                </ul>
                                            ) : 'None'}</div>
                                            <div><strong>Outputs:</strong> {item.outputs && item.outputs.length > 0 ? (
                                                <ul>
                                                    {item.outputs.map((output, i) => (
                                                        <li key={i}>{output.name || '(no name)'} : {output.type}</li>
                                                    ))}
                                                </ul>
                                            ) : 'None'}</div>
                                        </div>
                                    ))}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {deployed.address && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Deployment Successful</h2>
                        <div className="space-y-2">
                            <p><span className="font-semibold">Contract Address:</span>
                                <span className="font-mono ml-2 text-blue-400">
                                    {deployed.address}
                                </span>
                            </p>
                            <p><span className="font-semibold">Transaction Hash:</span>
                                <span className="font-mono ml-2 text-green-400">
                                    {deployed.txHash}
                                </span>
                            </p>
                        </div>
                        
                        {/* Test Contract Button */}
                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <button
                                onClick={() => navigate('/contract-testing')}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <span>🧪</span>
                                <span>Test Contract Now</span>
                            </button>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Contract auto-saved to testing dashboard
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
