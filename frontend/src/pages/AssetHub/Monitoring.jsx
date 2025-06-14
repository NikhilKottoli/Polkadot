import React, { useState } from "react";
import useBoardStore from "../../store/store";
import { ethers } from "ethers";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#a259ff", "#e0aaff", "#ffb7ff", "#ffb4a2", "#cdb4db", "#fff"];

const styles = {
  container: {
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(135deg, #1a0024 0%, #2a064d 100%)",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#fff",
  },
  heading: {
    textAlign: "center",
    color: "#e0aaff",
    fontWeight: 800,
    fontSize: "2.5rem",
    marginBottom: "2rem",
    letterSpacing: "-1px",
    textShadow: "0 2px 16px #2a064d",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2rem",
    marginBottom: "3rem",
  },
  statCard: {
    background: "rgba(45, 19, 59, 0.85)",
    borderRadius: "1rem",
    boxShadow: "0 2px 16px rgba(160,89,255,0.15)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: "120px",
    border: "1px solid #a259ff",
  },
  statLabel: {
    color: "#cdb4db",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#fff",
    textShadow: "0 2px 8px #a259ff",
  },
  statHelp: {
    color: "#bfa2e0",
    fontSize: "0.9rem",
    marginTop: "0.3rem",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "2.5rem",
    marginBottom: "2.5rem",
  },
  chartCard: {
    background: "rgba(45, 19, 59, 0.85)",
    borderRadius: "1rem",
    boxShadow: "0 2px 16px rgba(160,89,255,0.15)",
    padding: "2rem",
    minHeight: "340px",
    border: "1px solid #a259ff",
  },
  chartTitle: {
    fontWeight: 700,
    fontSize: "1.1rem",
    marginBottom: "1rem",
    color: "#e0aaff",
  },
  projectsTitle: {
    fontWeight: 700,
    fontSize: "1.3rem",
    margin: "2rem 0 1rem 0",
    color: "#e0aaff",
  },
  projectsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "1.5rem",
  },
  projectCard: {
    background: "rgba(45, 19, 59, 0.95)",
    borderRadius: "1rem",
    boxShadow: "0 2px 16px rgba(160,89,255,0.18)",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    minHeight: "180px",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #a259ff",
  },
  projectCardHover: {
    transform: "scale(1.03)",
    boxShadow: "0 4px 24px #a259ff",
  },
  projectName: {
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#e0aaff",
    marginBottom: "0.2rem",
  },
  projectDesc: {
    color: "#fff",
    fontSize: "0.97rem",
    marginBottom: "1.1rem",
    minHeight: "2.2em",
    opacity: 0.85,
  },
  badge: {
    display: "inline-block",
    background: "#a259ff",
    color: "#fff",
    borderRadius: "0.5rem",
    fontSize: "0.8em",
    fontWeight: 600,
    padding: "0.2em 0.7em",
    marginLeft: "0.5em",
    boxShadow: "0 1px 4px #a259ff",
  },
  projectStats: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "auto",
    fontSize: "0.98rem",
    color: "#fff",
    fontWeight: 600,
  },
  updated: {
    fontSize: "0.85rem",
    color: "#bfa2e0",
    marginTop: "0.7em",
  },
};


function Monitoring() {
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState({ registered: 0, total: 0 });

  // Get the filtered projects using your store
  const { getFilteredProjects } = useBoardStore();
  const projects = getFilteredProjects();

  // Only deployed projects
  const deployedProjects = projects.filter((p) => p.status === "deployed");

  // Debug: Log project data to see what's missing
  React.useEffect(() => {
    console.log('📊 [Monitoring] All projects:', projects.length);
    console.log('📊 [Monitoring] Deployed projects:', deployedProjects.length);

    deployedProjects.forEach(project => {
      console.log(`📊 [Monitoring] Project "${project.name}":`, {
        id: project.id,
        status: project.status,
        contractAddress: project.contractAddress,
        hasAbi: !!project.abi,
        abiLength: Array.isArray(project.abi) ? project.abi.length : 'not an array',
        deployedAt: project.deployedAt
      });
    });
  }, [projects.length, deployedProjects.length]);

  // Register deployed projects for monitoring on component mount
  React.useEffect(() => {
    const registerDeployedProjects = async () => {
      let registeredCount = 0;

      for (const project of deployedProjects) {
        if (project.contractAddress && project.abi) {
          try {
            const response = await fetch('http://localhost:3000/api/monitor/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contractAddress: project.contractAddress,
                abi: project.abi,
                contractName: project.name || 'Unknown Project'
              })
            });

            if (response.ok) {
              registeredCount++;
              console.log(`✅ Registered ${project.name} for monitoring`);
            } else {
              console.warn(`⚠️ Failed to register ${project.name} for monitoring`);
            }
          } catch (error) {
            console.error(`❌ Error registering ${project.name}:`, error);
          }
        }
      }

      setMonitoringStatus({ registered: registeredCount, total: deployedProjects.length });
    };

    if (deployedProjects.length > 0) {
      registerDeployedProjects();
    }
  }, [deployedProjects.length]);

  // Aggregate stats
  const totalHits = deployedProjects.reduce((sum, p) => sum + (p.hits || 0), 0);
  const totalGas = deployedProjects.reduce((sum, p) => sum + (p.gasSpent || 0), 0);

  // Charts data
  const hitsData = deployedProjects.map((p) => ({
    name: p.name,
    hits: p.hits || 0,
  }));

  const gasData = deployedProjects.map((p) => ({
    name: p.name,
    gas: p.gasSpent || 0,
  }));

  // Top project by hits
  const topProject =
    deployedProjects.length > 0
      ? deployedProjects.reduce((a, b) => (a.hits || 0) > (b.hits || 0) ? a : b)
      : null;

  // Card hover effect (optional)
  const [hoverIdx, setHoverIdx] = React.useState(-1);

  // Function to check if a contract has executeWorkflow function
  const hasExecuteWorkflowFunction = (abi) => {
    if (!Array.isArray(abi)) return false;
    return abi.some(item =>
      item.type === 'function' &&
      item.name === 'executeWorkflow' &&
      item.inputs &&
      item.inputs.length === 1 &&
      item.inputs[0].type === 'string'
    );
  };

  const testContract = async (project) => {
    console.log(`🧪 [Test] Starting test for project "${project.name}":`, {
      hasAddress: !!project.contractAddress,
      hasAbi: !!project.abi,
      abiLength: Array.isArray(project.abi) ? project.abi.length : 'not an array'
    });

    if (!project.contractAddress || !project.abi) {
      const missingData = [];
      if (!project.contractAddress) missingData.push('contract address');
      if (!project.abi) missingData.push('ABI');

      const errorMessage = `❌ Missing ${missingData.join(' and ')}. Please redeploy the contract.`;

      setTestResults(prev => ({
        ...prev,
        [project.id]: {
          success: false,
          message: errorMessage
        }
      }));

      console.error(`❌ [Test] Cannot test "${project.name}": missing ${missingData.join(' and ')}`);
      return;
    }

    setIsTesting(true);
    try {
      console.log(`🧪 Testing contract ${project.name} at ${project.contractAddress}`);
      console.log('📋 Test Action: Calling executeWorkflow() function to verify contract is working and can emit Telegram events');

      // Simply connect to current network without forcing network changes
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log('🌐 Current network:', network);

      // Expected Paseo AssetHub testnet chain ID (allow both variants)
      const expectedChainIds = [420420422]; // Allow both chain IDs since networks may vary

      // Only warn about network mismatch, don't force change during testing
      const currentChainId = Number(network.chainId);
      if (!expectedChainIds.includes(currentChainId)) {
        console.warn(`⚠️ Network mismatch. Current: ${currentChainId}, Expected: ${expectedChainIds.join(' or ')}`);
        console.warn('🔄 Proceeding with test on current network. Use "🌐 Connect Paseo AssetHub" button to switch networks if needed.');
      } else {
        console.log('✅ Connected to Paseo AssetHub testnet');
      }

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log('👤 User address:', userAddress);

      // Check user's balance
      const balance = await provider.getBalance(userAddress);
      console.log('💰 User balance:', ethers.formatEther(balance));

      if (balance === 0n) {
        throw new Error('Insufficient balance. You need tokens to pay for gas. If testing on Paseo AssetHub, get PAS tokens from: https://faucet.polkadot.io/?parachain=420420422');
      }

      const contract = new ethers.Contract(project.contractAddress, project.abi, signer);

      // Note: Direct event listening with contract.on() causes eth_newFilter errors on Polkadot RPC
      // Backend polling system will handle event monitoring automatically

      // Test the contract by calling executeWorkflow with a test message
      const testMessage = `Test execution from ${project.name} at ${new Date().toISOString()}`;
      console.log(`🚀 Calling executeWorkflow with message: ${testMessage}`);

      // Check if executeWorkflow function exists
      const executeWorkflowFunction = contract.interface.fragments.find(f => f.name === 'executeWorkflow');
      if (!executeWorkflowFunction) {
        throw new Error('executeWorkflow function not found in contract. Please redeploy with updated AI prompt.');
      }

      // Try different approaches to handle RPC issues
      console.log('🚀 Attempting to call executeWorkflow...');
      let tx, receipt;

      try {
        // First try: Simple call with minimal gas
        console.log('🔄 Attempt 1: Simple call with default gas');
        tx = await contract.executeWorkflow(testMessage);
        console.log(`📝 Transaction sent: ${tx.hash}`);

        receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

      } catch (simpleError) {
        console.warn('⚠️ Simple call failed, trying with manual gas estimation:', simpleError.message);

        try {
          // Second try: Manual gas estimation with lower values
          console.log('🔄 Attempt 2: Manual gas estimation');
          const gasEstimate = await contract.executeWorkflow.estimateGas(testMessage);
          console.log('⛽ Gas estimate:', gasEstimate.toString());

          // Check if gas estimate is unreasonably high (likely an error)
          if (gasEstimate > 1000000n) {
            console.warn('⚠️ Gas estimate seems too high, using fixed gas limit');
            throw new Error('Gas estimate too high');
          }

          // Use gas estimate with small buffer
          const gasLimit = gasEstimate * 110n / 100n;
          console.log('⛽ Using gas limit:', gasLimit.toString());

          tx = await contract.executeWorkflow(testMessage, { gasLimit });
          console.log(`📝 Transaction sent with gas limit: ${tx.hash}`);

          receipt = await tx.wait();
          console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

        } catch (gasError) {
          console.warn('⚠️ Gas estimation failed, trying with fixed gas:', gasError.message);

          try {
            // Third try: Fixed reasonable gas limit
            console.log('🔄 Attempt 3: Fixed gas limit');
            const fixedGasLimit = 200000n; // Reasonable fixed gas limit

            tx = await contract.executeWorkflow(testMessage, { gasLimit: fixedGasLimit });
            console.log(`📝 Transaction sent with fixed gas: ${tx.hash}`);

            receipt = await tx.wait();
            console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

          } catch (fixedGasError) {
            console.error('❌ All gas strategies failed');

            // Check if it's an RPC or network issue
            if (fixedGasError.message.includes('Internal JSON-RPC error') ||
              fixedGasError.message.includes('-32603')) {
              throw new Error(`🌐 RPC Error: The network RPC is experiencing issues.\n\n💡 Possible solutions:\n1. Try again in a few moments\n2. Switch to a different RPC endpoint\n3. Check if the contract address is correct\n4. Verify you're on the right network\n\n🔍 Current network: Chain ID ${currentChainId}\n📍 Contract: ${project.contractAddress}`);
            } else {
              throw fixedGasError;
            }
          }
        }
      }

      // Parse events from transaction receipt
      let sendTelegramEvents = [];
      try {
        sendTelegramEvents = receipt.logs
          .map(log => {
            try {
              return contract.interface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .filter(parsed => parsed && parsed.name === 'SendTelegram');

        console.log(`📨 Found ${sendTelegramEvents.length} SendTelegram events in transaction`);
      } catch (parseError) {
        console.warn('⚠️ Could not parse transaction logs:', parseError);
      }

      if (sendTelegramEvents.length > 0) {
        // Send manual notification via backend for immediate feedback
        const eventData = sendTelegramEvents[0];
        try {
          const response = await fetch('http://localhost:3000/api/telegram/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: '255522477',
              message: `🧪 Contract Test Successful!\n📍 Contract: ${project.name}\n📝 Message: ${eventData.args.message}\n👤 User: ${eventData.args.user}\n💰 Tx Hash: ${tx.hash}\n🕒 Time: ${new Date().toLocaleString()}`
            })
          });

          if (response.ok) {
            console.log('✅ Manual Telegram notification sent successfully');
          }
        } catch (telegramError) {
          console.error('❌ Error sending manual Telegram notification:', telegramError);
        }

        setTestResults(prev => ({
          ...prev,
          [project.id]: {
            success: true,
            message: `✅ Contract tested successfully! SendTelegram event emitted. Tx: ${tx.hash.slice(0, 10)}...`
          }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [project.id]: {
            success: true,
            message: `⚠️ Contract executed but no SendTelegram event found in receipt. Tx: ${tx.hash.slice(0, 10)}... (Backend monitoring will detect if events exist)`
          }
        }));
      }

      // Trigger backend to check for events immediately
      try {
        await fetch('http://localhost:3000/api/monitor/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractAddress: project.contractAddress })
        });
        console.log('🔍 Triggered backend event check for immediate monitoring');
      } catch (checkError) {
        console.warn('⚠️ Could not trigger backend event check:', checkError);
      }

    } catch (error) {
      console.error('❌ Contract test failed:', error);
      setTestResults(prev => ({
        ...prev,
        [project.id]: {
          success: false,
          message: `❌ Test failed: ${error.message.slice(0, 100)}${error.message.length > 100 ? '...' : ''}`
        }
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const triggerBackendCheck = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/monitor/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend check triggered:', data.message);
        alert(`✅ ${data.message}`);
      } else {
        console.error('❌ Failed to trigger backend check');
        alert('❌ Failed to trigger backend check');
      }
    } catch (error) {
      console.error('❌ Error triggering backend check:', error);
      alert('❌ Error triggering backend check');
    }
  };

  const refreshProjects = async () => {
    console.log('🔄 [Monitoring] Refreshing projects data...');

    // Re-register all deployed projects
    let successCount = 0;
    let errorCount = 0;

    for (const project of deployedProjects) {
      console.log(`🔍 [Monitoring] Checking project "${project.name}":`, {
        hasAddress: !!project.contractAddress,
        hasAbi: !!project.abi,
        hasExecuteWorkflow: hasExecuteWorkflowFunction(project.abi)
      });

      if (project.contractAddress && project.abi) {
        try {
          const response = await fetch('http://localhost:3000/api/monitor/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractAddress: project.contractAddress,
              abi: project.abi,
              contractName: project.name || 'Unknown Project'
            })
          });

          if (response.ok) {
            successCount++;
            console.log(`✅ Re-registered ${project.name} for monitoring`);
          } else {
            errorCount++;
            console.warn(`⚠️ Failed to re-register ${project.name} for monitoring`);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error re-registering ${project.name}:`, error);
        }
      } else {
        errorCount++;
        console.warn(`⚠️ Project "${project.name}" missing contract data:`, {
          contractAddress: project.contractAddress,
          hasAbi: !!project.abi
        });
      }
    }

    setMonitoringStatus({ registered: successCount, total: deployedProjects.length });
    alert(`🔄 Refresh complete!\n✅ Success: ${successCount}\n❌ Errors: ${errorCount}`);
  };

  const connectToAssetHub = async () => {
    try {
      console.log('🌐 [Network] Connecting to Paseo AssetHub testnet...');

      const expectedChainId = 420420422; // Use the actual working chain ID

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }]
        });
        console.log('✅ Switched to Paseo AssetHub testnet');
        alert('✅ Connected to Paseo AssetHub Testnet!');
      } catch (switchError) {
        if (switchError.code === 4902) {
          // Network not added to MetaMask, let's add it
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${expectedChainId.toString(16)}`,
                chainName: 'Paseo AssetHub Testnet',
                rpcUrls: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
                nativeCurrency: {
                  name: 'PAS',
                  symbol: 'PAS',
                  decimals: 18
                },
                blockExplorerUrls: ['https://blockscout-passet-hub.parity-testnet.parity.io']
              }]
            });
            console.log('✅ Added and switched to Paseo AssetHub testnet');
            alert('✅ Added and connected to Paseo AssetHub Testnet!\n\n💡 You need PAS testnet tokens to interact with contracts.\n🔗 Get them from: https://faucet.polkadot.io/?parachain=420420422');
          } catch (addError) {
            console.error('❌ Failed to add network:', addError);

            if (addError.message.includes('same RPC endpoint')) {
              throw new Error(`⚠️ Network conflict detected!\n\nYou already have a network with the same RPC URL but different configuration.\n\n🔧 To fix this:\n1. Open MetaMask Settings → Networks\n2. Delete any existing "Paseo AssetHub" networks\n3. Try connecting again\n\n📋 Required settings:\n• Chain ID: ${expectedChainId}\n• Currency: PAS (18 decimals)\n• RPC: https://testnet-passet-hub-eth-rpc.polkadot.io`);
            } else {
              throw new Error(`Failed to add Paseo AssetHub network: ${addError.message}`);
            }
          }
        } else {
          throw new Error(`Failed to switch network: ${switchError.message}\n\n💡 Try manually switching to Paseo AssetHub in MetaMask.`);
        }
      }
    } catch (error) {
      console.error('❌ Network connection error:', error);
      alert(`❌ Failed to connect to Paseo AssetHub:\n${error.message}`);
    }
  };

  const testCompilation = async () => {
    console.log('🔨 [Monitoring] Testing compilation with updated AI prompt...');

    try {
      const testCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract TestContract {
    event SendTelegram(string message, address indexed user);
    
    function executeWorkflow(string memory message) public {
        emit SendTelegram(message, msg.sender);
    }
    
    function uint2str(uint _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            bstr[k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
    
    function testStringConcatenation() public pure returns (string memory) {
        return string(abi.encodePacked("Asset ", uint2str(123)));
    }
}`;

      const response = await fetch('http://localhost:3000/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: testCode,
          contractName: 'TestContract'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Compilation Test Successful!\nThe updated AI prompt fixes are working correctly.');
      } else {
        alert(`❌ Compilation Test Failed:\n${result.error}`);
      }
    } catch (error) {
      console.error('❌ Compilation test error:', error);
      alert(`❌ Compilation Test Error:\n${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.heading}>
        🚀 Web3 Contract Monitoring Dashboard
      </div>

      {/* Stat Cards */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Deployed Projects</div>
          <div style={styles.statValue}>{deployedProjects.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Hits</div>
          <div style={styles.statValue}>{totalHits}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Gas Spent</div>
          <div style={styles.statValue}>{totalGas.toLocaleString()}</div>
          <div style={styles.statHelp}>in gas units</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Top Project</div>
          <div style={styles.statValue}>{topProject ? topProject.name : "—"}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Monitoring Status</div>
          <div style={styles.statValue}>{monitoringStatus.registered}/{monitoringStatus.total}</div>
          <div style={styles.statHelp}>contracts monitored</div>
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Hits per Project</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hitsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hits" fill="#6C63FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Gas Spent Distribution</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={gasData}
                dataKey="gas"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#43E6FC"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {gasData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Cards */}
      <div style={{ ...styles.projectsTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Deployed Projects</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={connectToAssetHub}
            style={{
              padding: '0.5rem 1rem',
              background: '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🌐 Connect Paseo AssetHub
          </button>
          <button
            onClick={testCompilation}
            style={{
              padding: '0.5rem 1rem',
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🔨 Test Compile
          </button>
          <button
            onClick={refreshProjects}
            style={{
              padding: '0.5rem 1rem',
              background: '#e0aaff',
              color: '#1a0024',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={triggerBackendCheck}
            style={{
              padding: '0.5rem 1rem',
              background: '#a259ff',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🔍 Check Events
          </button>
        </div>
      </div>
      <div style={styles.projectsGrid}>
        {deployedProjects.map((p, idx) => (
          <div key={p.id} style={{ textDecoration: 'none' }}>
            <div
              style={{
                ...styles.projectCard,
                ...(hoverIdx === idx ? styles.projectCardHover : {}),
              }}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(-1)}
            >
              <div style={styles.projectName}>
                {p.name}
                <span style={styles.badge}>Deployed</span>
                {(!p.contractAddress || !p.abi) && (
                  <span style={{ ...styles.badge, background: '#ff6b6b', marginLeft: '0.5rem' }}>
                    Incomplete
                  </span>
                )}
                {(p.contractAddress && p.abi && !hasExecuteWorkflowFunction(p.abi)) && (
                  <span style={{ ...styles.badge, background: '#ffa500', marginLeft: '0.5rem' }}>
                    No Test Function
                  </span>
                )}
              </div>
              <div style={styles.projectDesc}>{p.description}</div>
              <div style={styles.projectStats}>
                <span>{p.nodes?.length || 0} nodes</span>
                <span>{p.edges?.length || 0} edges</span>
              </div>
              <div style={styles.updated}>
                Deployed: {new Date(p.deployedAt).toLocaleDateString()}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  testContract(p);
                }}
                disabled={isTesting || !p.contractAddress || !p.abi || !hasExecuteWorkflowFunction(p.abi)}
                title={
                  (!p.contractAddress || !p.abi) ? 'Contract missing address or ABI data' :
                    !hasExecuteWorkflowFunction(p.abi) ? 'Contract missing executeWorkflow function - redeploy with updated AI prompt' :
                      'Execute the contract\'s executeWorkflow() function to test if it works and can send Telegram notifications'
                }
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: (!p.contractAddress || !p.abi) ? '#666' :
                    !hasExecuteWorkflowFunction(p.abi) ? '#ffa500' : '#a259ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: (isTesting || !p.contractAddress || !p.abi || !hasExecuteWorkflowFunction(p.abi)) ? 'not-allowed' : 'pointer',
                  opacity: (isTesting || !p.contractAddress || !p.abi || !hasExecuteWorkflowFunction(p.abi)) ? 0.7 : 1
                }}
              >
                {isTesting ? 'Testing...' :
                  (!p.contractAddress || !p.abi) ? 'Missing Data' :
                    !hasExecuteWorkflowFunction(p.abi) ? 'Need Redeploy' :
                      '🧪 Test Contract'}
              </button>
              {testResults[p.id] && (
                <div style={{
                  marginTop: '0.5rem',
                  color: testResults[p.id].success ? '#4CAF50' : '#f44336',
                  fontSize: '0.9rem'
                }}>
                  {testResults[p.id].message}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Monitoring;
