import React, { useState } from "react";
import useBoardStore from "../../store/store";
import { ethers } from "ethers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SiteHeader } from "@/components/site-header";
import { AreaChartIcon, MessageCircle, Bell, CheckCircle, AlertCircle } from "lucide-react";
const COLORS = ["#a259ff", "#e0aaff", "#ffb7ff", "#ffb4a2", "#cdb4db", "#fff"];

function Monitoring() {
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState({
    registered: 0,
    total: 0,
  });
  const [telegramNotifications, setTelegramNotifications] = useState([]);
  const [deploymentNotifications, setDeploymentNotifications] = useState([]);

  // Get the filtered projects using your store
  const { getFilteredProjects } = useBoardStore();
  const projects = getFilteredProjects();

  // Only deployed projects
  const deployedProjects = projects.filter((p) => p.status === "deployed");

  // Debug: Log project data to see what's missing
  React.useEffect(() => {
    console.log("📊 [Monitoring] All projects:", projects.length);
    console.log("📊 [Monitoring] Deployed projects:", deployedProjects.length);

    deployedProjects.forEach((project) => {
      console.log(`📊 [Monitoring] Project "${project.name}":`, {
        id: project.id,
        status: project.status,
        contractAddress: project.contractAddress,
        hasAbi: !!project.abi,
        abiLength: Array.isArray(project.abi)
          ? project.abi.length
          : "not an array",
        deployedAt: project.deployedAt,
      });
    });
  }, [projects.length, deployedProjects.length]);

  // Check for deployment notifications
  React.useEffect(() => {
    const checkDeploymentStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/monitor/status");
        if (response.ok) {
          const status = await response.json();
          console.log("📡 [Monitoring] Backend status:", status);
          
          if (status.contracts) {
            const notifications = status.contracts.map(contract => ({
              id: contract.address,
              type: 'deployment',
              title: `Contract Deployed: ${contract.name}`,
              message: `Contract monitoring started for ${contract.name}`,
              address: contract.address,
              timestamp: contract.deployedAt,
              status: contract.isMonitoring ? 'active' : 'inactive'
            }));
            setDeploymentNotifications(notifications);
          }
        }
      } catch (error) {
        console.error("❌ Failed to fetch monitoring status:", error);
      }
    };

    checkDeploymentStatus();
    const interval = setInterval(checkDeploymentStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Register deployed projects for monitoring on component mount
  React.useEffect(() => {
    const registerDeployedProjects = async () => {
      let registeredCount = 0;

      for (const project of deployedProjects) {
        if (project.contractAddress && project.abi) {
          try {
            const response = await fetch(
              "http://localhost:3000/api/monitor/register",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contractAddress: project.contractAddress,
                  abi: project.abi,
                  contractName: project.name || "Unknown Project",
                }),
              }
            );

            if (response.ok) {
              registeredCount++;
              console.log(`✅ Registered ${project.name} for monitoring`);
              
              // Add to telegram notifications
              setTelegramNotifications(prev => [...prev, {
                id: `register-${project.id}-${Date.now()}`,
                type: 'monitoring',
                title: `Monitoring Started`,
                message: `Telegram monitoring enabled for ${project.name}`,
                contractName: project.name,
                address: project.contractAddress,
                timestamp: new Date().toISOString(),
                status: 'active'
              }]);
            } else {
              console.warn(
                `⚠️ Failed to register ${project.name} for monitoring`
              );
            }
          } catch (error) {
            console.error(`❌ Error registering ${project.name}:`, error);
          }
        }
      }

      setMonitoringStatus({
        registered: registeredCount,
        total: deployedProjects.length,
      });
    };

    if (deployedProjects.length > 0) {
      registerDeployedProjects();
    }
  }, [deployedProjects.length]);

  // Aggregate stats
  const totalHits = deployedProjects.reduce((sum, p) => sum + (p.hits || 0), 0);
  const totalGas = deployedProjects.reduce(
    (sum, p) => sum + (p.gasSpent || 0),
    0
  );

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
      ? deployedProjects.reduce((a, b) =>
          (a.hits || 0) > (b.hits || 0) ? a : b
        )
      : null;

  // Card hover effect (optional)
  const [hoverIdx, setHoverIdx] = React.useState(-1);

  // Function to check if a contract has executeWorkflow function
  const hasExecuteWorkflowFunction = (abi) => {
    if (!Array.isArray(abi)) return false;
    return abi.some(
      (item) =>
        item.type === "function" &&
        item.name === "executeWorkflow" &&
        item.inputs &&
        item.inputs.length === 1 &&
        item.inputs[0].type === "string"
    );
  };

  const testContract = async (project) => {
    console.log(`🧪 [Test] Starting test for project "${project.name}":`, {
      hasAddress: !!project.contractAddress,
      hasAbi: !!project.abi,
      abiLength: Array.isArray(project.abi)
        ? project.abi.length
        : "not an array",
    });

    if (!project.contractAddress || !project.abi) {
      const missingData = [];
      if (!project.contractAddress) missingData.push("contract address");
      if (!project.abi) missingData.push("ABI");

      const errorMessage = `❌ Missing ${missingData.join(
        " and "
      )}. Please redeploy the contract.`;

      setTestResults((prev) => ({
        ...prev,
        [project.id]: {
          success: false,
          message: errorMessage,
        },
      }));

      console.error(
        `❌ [Test] Cannot test "${project.name}": missing ${missingData.join(
          " and "
        )}`
      );
      return;
    }

    setIsTesting(true);
    try {
      console.log(
        `🧪 Testing contract ${project.name} at ${project.contractAddress}`
      );
      console.log(
        "📋 Test Action: Calling executeWorkflow() function to verify contract is working and can emit Telegram events"
      );

      // Simply connect to current network without forcing network changes
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log("🌐 Current network:", network);

      // Expected Paseo AssetHub testnet chain ID (allow both variants)
      const expectedChainIds = [420420422]; // Allow both chain IDs since networks may vary

      // Only warn about network mismatch, don't force change during testing
      const currentChainId = Number(network.chainId);
      if (!expectedChainIds.includes(currentChainId)) {
        console.warn(
          `⚠️ Network mismatch. Current: ${currentChainId}, Expected: ${expectedChainIds.join(
            " or "
          )}`
        );
        console.warn(
          '🔄 Proceeding with test on current network. Use "🌐 Connect Paseo AssetHub" button to switch networks if needed.'
        );
      } else {
        console.log("✅ Connected to Paseo AssetHub testnet");
      }

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log("👤 User address:", userAddress);

      // Check user's balance
      const balance = await provider.getBalance(userAddress);
      console.log("💰 User balance:", ethers.formatEther(balance));

      if (balance === 0n) {
        throw new Error(
          "Insufficient balance. You need tokens to pay for gas. If testing on Paseo AssetHub, get PAS tokens from: https://faucet.polkadot.io/?parachain=420420422"
        );
      }

      const contract = new ethers.Contract(
        project.contractAddress,
        project.abi,
        signer
      );

      // Note: Direct event listening with contract.on() causes eth_newFilter errors on Polkadot RPC
      // Backend polling system will handle event monitoring automatically

      // Test the contract by calling executeWorkflow with a test message
      const testMessage = `Test execution from ${
        project.name
      } at ${new Date().toISOString()}`;
      console.log(`🚀 Calling executeWorkflow with message: ${testMessage}`);

      // Check if executeWorkflow function exists
      const executeWorkflowFunction = contract.interface.fragments.find(
        (f) => f.name === "executeWorkflow"
      );
      if (!executeWorkflowFunction) {
        throw new Error(
          "executeWorkflow function not found in contract. Please redeploy with updated AI prompt."
        );
      }

      // Try different approaches to handle RPC issues
      console.log("🚀 Attempting to call executeWorkflow...");
      let tx, receipt;

      try {
        // First try: Simple call with minimal gas
        console.log("🔄 Attempt 1: Simple call with default gas");
        tx = await contract.executeWorkflow(testMessage);
        console.log(`📝 Transaction sent: ${tx.hash}`);

        receipt = await tx.wait();
        console.log(
          `✅ Transaction confirmed in block: ${receipt.blockNumber}`
        );
      } catch (simpleError) {
        console.warn(
          "⚠️ Simple call failed, trying with manual gas estimation:",
          simpleError.message
        );

        try {
          // Second try: Manual gas estimation with lower values
          console.log("🔄 Attempt 2: Manual gas estimation");
          const gasEstimate = await contract.executeWorkflow.estimateGas(
            testMessage
          );
          console.log("⛽ Gas estimate:", gasEstimate.toString());

          // Check if gas estimate is unreasonably high (likely an error)
          if (gasEstimate > 1000000n) {
            console.warn(
              "⚠️ Gas estimate seems too high, using fixed gas limit"
            );
            throw new Error("Gas estimate too high");
          }

          // Use gas estimate with small buffer
          const gasLimit = (gasEstimate * 110n) / 100n;
          console.log("⛽ Using gas limit:", gasLimit.toString());

          tx = await contract.executeWorkflow(testMessage, { gasLimit });
          console.log(`📝 Transaction sent with gas limit: ${tx.hash}`);

          receipt = await tx.wait();
          console.log(
            `✅ Transaction confirmed in block: ${receipt.blockNumber}`
          );
        } catch (gasError) {
          console.warn(
            "⚠️ Gas estimation failed, trying with fixed gas:",
            gasError.message
          );

          try {
            // Third try: Fixed reasonable gas limit
            console.log("🔄 Attempt 3: Fixed gas limit");
            const fixedGasLimit = 200000n; // Reasonable fixed gas limit

            tx = await contract.executeWorkflow(testMessage, {
              gasLimit: fixedGasLimit,
            });
            console.log(`📝 Transaction sent with fixed gas: ${tx.hash}`);

            receipt = await tx.wait();
            console.log(
              `✅ Transaction confirmed in block: ${receipt.blockNumber}`
            );
          } catch (fixedGasError) {
            console.error("❌ All gas strategies failed");

            // Check if it's an RPC or network issue
            if (
              fixedGasError.message.includes("Internal JSON-RPC error") ||
              fixedGasError.message.includes("-32603")
            ) {
              throw new Error(
                `🌐 RPC Error: The network RPC is experiencing issues.\n\n💡 Possible solutions:\n1. Try again in a few moments\n2. Switch to a different RPC endpoint\n3. Check if the contract address is correct\n4. Verify you're on the right network\n\n🔍 Current network: Chain ID ${currentChainId}\n📍 Contract: ${project.contractAddress}`
              );
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
          .map((log) => {
            try {
              return contract.interface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .filter((parsed) => parsed && (
            parsed.name === "SendTelegram" || 
            parsed.name === "SendTelegramNotification" ||
            parsed.name === "TelegramNotify" ||
            parsed.name === "NotifyTelegram" ||
            parsed.name === "SendNotification"
          ));

        console.log(
          `📨 Found ${sendTelegramEvents.length} telegram notification events in transaction`
        );
      } catch (parseError) {
        console.warn("⚠️ Could not parse transaction logs:", parseError);
      }

      if (sendTelegramEvents.length > 0) {
        // Send manual notification via backend for immediate feedback
        const eventData = sendTelegramEvents[0];
        try {
          // Handle different event argument structures
          let message, user;
          if (eventData.args.message && eventData.args.user) {
            message = eventData.args.message;
            user = eventData.args.user;
          } else if (eventData.args.msg && eventData.args.sender) {
            message = eventData.args.msg;
            user = eventData.args.sender;
          } else if (eventData.args.text && eventData.args.from) {
            message = eventData.args.text;
            user = eventData.args.from;
          } else if (eventData.args.length >= 2) {
            message = eventData.args[0];
            user = eventData.args[1];
          } else {
            message = `${eventData.name} event triggered`;
            user = "Unknown";
          }

          const response = await fetch(
            "http://localhost:3000/api/telegram/send",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chatId: "255522477",
                message: `🧪 Contract Test Successful!\n📍 Event: ${eventData.name}\n📍 Contract: ${
                  project.name
                }\n📝 Message: ${message}\n👤 User: ${user}\n💰 Tx Hash: ${
                  tx.hash
                }\n🕒 Time: ${new Date().toLocaleString()}`,
              }),
            }
          );

          if (response.ok) {
            console.log("✅ Manual Telegram notification sent successfully");
          }
        } catch (telegramError) {
          console.error(
            "❌ Error sending manual Telegram notification:",
            telegramError
          );
        }

        setTestResults((prev) => ({
          ...prev,
          [project.id]: {
            success: true,
            message: `✅ Contract tested successfully! ${eventData.name} event emitted. Tx: ${tx.hash.slice(
              0,
              10
            )}...`,
          },
        }));

        // Add to telegram notifications for UI display
        setTelegramNotifications(prev => [...prev, {
          id: `test-${project.id}-${Date.now()}`,
          type: 'event',
          title: `${eventData.name} Event Detected`,
          message: `Contract test triggered telegram event: ${message}`,
          contractName: project.name,
          address: project.contractAddress,
          timestamp: new Date().toISOString(),
          status: 'active',
          eventType: eventData.name,
          transactionHash: tx.hash
        }]);
      } else {
        setTestResults((prev) => ({
          ...prev,
          [project.id]: {
            success: true,
            message: `⚠️ Contract executed but no SendTelegram event found in receipt. Tx: ${tx.hash.slice(
              0,
              10
            )}... (Backend monitoring will detect if events exist)`,
          },
        }));
      }

      // Trigger backend to check for events immediately
      try {
        await fetch("http://localhost:3000/api/monitor/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractAddress: project.contractAddress }),
        });
        console.log(
          "🔍 Triggered backend event check for immediate monitoring"
        );
      } catch (checkError) {
        console.warn("⚠️ Could not trigger backend event check:", checkError);
      }
    } catch (error) {
      console.error("❌ Contract test failed:", error);
      setTestResults((prev) => ({
        ...prev,
        [project.id]: {
          success: false,
          message: `❌ Test failed: ${error.message.slice(0, 100)}${
            error.message.length > 100 ? "..." : ""
          }`,
        },
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const triggerBackendCheck = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/monitor/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backend check triggered:", data.message);
        alert(`✅ ${data.message}`);
      } else {
        console.error("❌ Failed to trigger backend check");
        alert("❌ Failed to trigger backend check");
      }
    } catch (error) {
      console.error("❌ Error triggering backend check:", error);
      alert("❌ Error triggering backend check");
    }
  };

  const refreshProjects = async () => {
    console.log("🔄 [Monitoring] Refreshing projects data...");

    // Re-register all deployed projects
    let successCount = 0;
    let errorCount = 0;

    for (const project of deployedProjects) {
      console.log(`🔍 [Monitoring] Checking project "${project.name}":`, {
        hasAddress: !!project.contractAddress,
        hasAbi: !!project.abi,
        hasExecuteWorkflow: hasExecuteWorkflowFunction(project.abi),
      });

      if (project.contractAddress && project.abi) {
        try {
          const response = await fetch(
            "http://localhost:3000/api/monitor/register",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contractAddress: project.contractAddress,
                abi: project.abi,
                contractName: project.name || "Unknown Project",
              }),
            }
          );

          if (response.ok) {
            successCount++;
            console.log(`✅ Re-registered ${project.name} for monitoring`);
          } else {
            errorCount++;
            console.warn(
              `⚠️ Failed to re-register ${project.name} for monitoring`
            );
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error re-registering ${project.name}:`, error);
        }
      } else {
        errorCount++;
        console.warn(`⚠️ Project "${project.name}" missing contract data:`, {
          contractAddress: project.contractAddress,
          hasAbi: !!project.abi,
        });
      }
    }

    setMonitoringStatus({
      registered: successCount,
      total: deployedProjects.length,
    });
    alert(
      `🔄 Refresh complete!\n✅ Success: ${successCount}\n❌ Errors: ${errorCount}`
    );
  };

  const connectToAssetHub = async () => {
    try {
      console.log("🌐 [Network] Connecting to Paseo AssetHub testnet...");

      const expectedChainId = 420420422; // Use the actual working chain ID

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
        });
        console.log("✅ Switched to Paseo AssetHub testnet");
        alert("✅ Connected to Paseo AssetHub Testnet!");
      } catch (switchError) {
        if (switchError.code === 4902) {
          // Network not added to MetaMask, let's add it
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${expectedChainId.toString(16)}`,
                  chainName: "Paseo AssetHub Testnet",
                  rpcUrls: ["https://testnet-passet-hub-eth-rpc.polkadot.io"],
                  nativeCurrency: {
                    name: "PAS",
                    symbol: "PAS",
                    decimals: 18,
                  },
                  blockExplorerUrls: [
                    "https://blockscout-passet-hub.parity-testnet.parity.io",
                  ],
                },
              ],
            });
            console.log("✅ Added and switched to Paseo AssetHub testnet");
            alert(
              "✅ Added and connected to Paseo AssetHub Testnet!\n\n💡 You need PAS testnet tokens to interact with contracts.\n🔗 Get them from: https://faucet.polkadot.io/?parachain=420420422"
            );
          } catch (addError) {
            console.error("❌ Failed to add network:", addError);

            if (addError.message.includes("same RPC endpoint")) {
              throw new Error(
                `⚠️ Network conflict detected!\n\nYou already have a network with the same RPC URL but different configuration.\n\n🔧 To fix this:\n1. Open MetaMask Settings → Networks\n2. Delete any existing "Paseo AssetHub" networks\n3. Try connecting again\n\n📋 Required settings:\n• Chain ID: ${expectedChainId}\n• Currency: PAS (18 decimals)\n• RPC: https://testnet-passet-hub-eth-rpc.polkadot.io`
              );
            } else {
              throw new Error(
                `Failed to add Paseo AssetHub network: ${addError.message}`
              );
            }
          }
        } else {
          throw new Error(
            `Failed to switch network: ${switchError.message}\n\n💡 Try manually switching to Paseo AssetHub in MetaMask.`
          );
        }
      }
    } catch (error) {
      console.error("❌ Network connection error:", error);
      alert(`❌ Failed to connect to Paseo AssetHub:\n${error.message}`);
    }
  };

  const testCompilation = async () => {
    console.log(
      "🔨 [Monitoring] Testing compilation with updated AI prompt..."
    );

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

      const response = await fetch("http://localhost:3000/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: testCode,
          contractName: "TestContract",
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          "✅ Compilation Test Successful!\nThe updated AI prompt fixes are working correctly."
        );
      } else {
        alert(`❌ Compilation Test Failed:\n${result.error}`);
      }
    } catch (error) {
      console.error("❌ Compilation test error:", error);
      alert(`❌ Compilation Test Error:\n${error.message}`);
    }
  };

  // Test telegram system function
  const testTelegramSystem = async () => {
    try {
      console.log("🧪 Testing Telegram notification system...");
      
      const response = await fetch("http://localhost:3000/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `🧪 Test from Monitoring Dashboard\n📊 Time: ${new Date().toLocaleString()}\n📈 Projects: ${deployedProjects.length}\n🔔 Status: Active`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Telegram test successful:", data);
        
        // Add to telegram notifications
        setTelegramNotifications(prev => [...prev, {
          id: `telegram-test-${Date.now()}`,
          type: 'test',
          title: `Telegram System Test`,
          message: `Test notification sent successfully to Telegram`,
          timestamp: new Date().toISOString(),
          status: 'active'
        }]);
        
        alert("✅ Telegram test notification sent successfully!");
      } else {
        console.error("❌ Telegram test failed");
        alert("❌ Telegram test failed - check console for details");
      }
    } catch (error) {
      console.error("❌ Error testing Telegram system:", error);
      alert(`❌ Error testing Telegram system: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 pt-0 px-0 bg-background font-sans text-foreground rounded-2xl mt-2">
      <SiteHeader />
      <div className="p-8 px-20 pt-16">
        <h1 className="  text-3xl my-8 mt-4 tracking-tight drop-shadow-lg font-bold text-white flex items-center gap-6">
          <div className="bg-pink-500/20 p-4 rounded-full">
            <AreaChartIcon />
          </div>{" "}
          Web3 Contract Monitoring Dashboard
        </h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="bg-card rounded-2xl shadow-lg p-8 flex flex-col items-start min-h-[120px] border border-border">
            <div className="text-muted-foreground font-semibold text-base mb-2">
              Deployed Projects
            </div>
            <div className="text-3xl font-bold text-foreground drop-shadow-md">
              {deployedProjects.length}
            </div>
          </div>
          <div className="bg-card rounded-2xl shadow-lg p-8 flex flex-col items-start min-h-[120px] border border-border">
            <div className="text-muted-foreground font-semibold text-base mb-2">
              Total Hits
            </div>
            <div className="text-3xl font-bold text-foreground drop-shadow-md">
              {totalHits}
            </div>
          </div>
          <div className="bg-card rounded-2xl shadow-lg p-8 flex flex-col items-start min-h-[120px] border border-border">
            <div className="text-muted-foreground font-semibold text-base mb-2">
              Total Gas Spent
            </div>
            <div className="text-3xl font-bold text-foreground drop-shadow-md">
              {totalGas.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-sm mt-1">
              in gas units
            </div>
          </div>
          <div className="bg-card rounded-2xl shadow-lg p-8 flex flex-col items-start min-h-[120px] border border-border">
            <div className="text-muted-foreground font-semibold text-base mb-2">
              Top Project
            </div>
            <div className="text-3xl font-bold text-foreground drop-shadow-md">
              {topProject ? topProject.name : "—"}
            </div>
          </div>
          <div className="bg-card rounded-2xl shadow-lg p-8 flex flex-col items-start min-h-[120px] border border-border">
            <div className="text-muted-foreground font-semibold text-base mb-2">
              Monitoring Status
            </div>
            <div className="text-3xl font-bold text-foreground drop-shadow-md">
              {monitoringStatus.registered}/{monitoringStatus.total}
            </div>
            <div className="text-muted-foreground text-sm mt-1">
              contracts monitored
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 mt-16">
          <h2 className="font-bold text-xl text-foreground">Overview</h2>
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          <div className="bg-card rounded-2xl shadow-lg p-8 min-h-[340px] border border-border">
            <h3 className="font-bold text-lg mb-4 text-card-foreground">
              Hits per Project
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hitsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="hits"
                  fill="hsl(var(--accent))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-2xl shadow-lg p-8 min-h-[340px] border border-border">
            <h3 className="font-bold text-lg mb-4 text-card-foreground">
              Gas Spent Distribution
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={gasData}
                  dataKey="gas"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {gasData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Telegram Notifications Section */}
        <div className="mt-16 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            <h2 className="font-bold text-xl text-foreground">
              Telegram Notifications
            </h2>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-sm">
              Live Monitoring
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Deployment Notifications */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-lg text-card-foreground">
                  Deployment Status
                </h3>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                  {deploymentNotifications.filter(n => n.status === 'active').length} Active
                </span>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {deploymentNotifications.length > 0 ? deploymentNotifications.map(notification => (
                  <div key={notification.id} className="bg-background/50 rounded-lg p-3 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.status === 'active' ? 'bg-green-400' : 'bg-orange-400'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-card-foreground">
                          {notification.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {notification.address && `${notification.address.slice(0, 10)}...`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No deployment notifications yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Event Notifications */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-lg text-card-foreground">
                  Event Monitoring
                </h3>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                  {telegramNotifications.length} Events
                </span>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {telegramNotifications.length > 0 ? telegramNotifications.map(notification => (
                  <div key={notification.id} className="bg-background/50 rounded-lg p-3 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.status === 'active' ? 'bg-blue-400' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-card-foreground">
                          {notification.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </div>
                        {notification.contractName && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Contract: {notification.contractName}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No telegram events detected yet</p>
                    <p className="text-xs mt-1">Events will appear when contracts emit telegram notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Monitoring Stats */}
          <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <AreaChartIcon className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-lg text-card-foreground">
                Monitoring Overview
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {monitoringStatus.registered}
                </div>
                <div className="text-xs text-muted-foreground">
                  Contracts Monitored
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {deploymentNotifications.filter(n => n.status === 'active').length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Active Deployments
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {telegramNotifications.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Events
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {deployedProjects.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Projects
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Cards */}
        <div className="flex justify-between items-center mb-4 mt-16">
          <h2 className="font-bold text-xl text-foreground">
            Deployed Projects
          </h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={connectToAssetHub}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500/30 text-slate-100 border border-slate-700 rounded-lg cursor-pointer text-sm font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                />
              </svg>
              Connect Paseo AssetHub
            </button>

            <button
              onClick={testCompilation}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/30 text-emerald-100 border border-emerald-700 rounded-lg cursor-pointer text-sm font-semibold hover:bg-emerald-700 hover:border-emerald-600 transition-all duration-200 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              Test Compile
            </button>

            <button
              onClick={refreshProjects}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-blue-100 border border-blue-700 rounded-lg cursor-pointer text-sm font-semibold hover:bg-blue-700 hover:border-blue-600 transition-all duration-200 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            <button
              onClick={triggerBackendCheck}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 text-purple-100 border border-purple-700 rounded-lg cursor-pointer text-sm font-semibold hover:bg-purple-700 hover:border-purple-600 transition-all duration-200 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Check Events
            </button>

            <button
              onClick={testTelegramSystem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-blue-100 border border-blue-700 rounded-lg cursor-pointer text-sm font-semibold hover:bg-blue-700 hover:border-blue-600 transition-all duration-200 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Test Telegram
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deployedProjects.map((p, idx) => (
            <div key={p.id} className="no-underline">
              <div
                className={`bg-card rounded-2xl shadow-lg p-6 flex flex-col min-h-[300px] transition-all duration-200 border border-border ${
                  hoverIdx === idx ? "transform scale-105 shadow-lg" : ""
                }`}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(-1)}
              >
                <div className="font-bold text-lg text-card-foreground mb-1">
                  <span className="ml-2"> {p.name}</span>

                  <br />
                  <div className="text-card-foreground text-sm mb-4 min-h-[2.2em] opacity-85 ml-2">
                    {p.description}
                  </div>
                  <span className="inline-block bg-green-500/30 text-accent-foreground rounded-lg text-xs font-semibold px-3 py-1 ml-2 shadow-sm">
                    Deployed
                  </span>
                  {(!p.contractAddress || !p.abi) && (
                    <span className="inline-block bg-red-500/20 text-destructive-foreground rounded-lg text-xs font-semibold px-3 py-1 ml-2">
                      Incomplete
                    </span>
                  )}
                  {p.contractAddress &&
                    p.abi &&
                    !hasExecuteWorkflowFunction(p.abi) && (
                      <span className="inline-block bg-orange-600 text-white rounded-lg text-xs font-semibold px-3 py-1 ml-2">
                        No Test Function
                      </span>
                    )}
                </div>

                <div className="flex justify-between mt-auto text-sm text-card-foreground font-semibold">
                  <span>{p.nodes?.length || 0} nodes</span>
                  <span>{p.edges?.length || 0} edges</span>
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Deployed: {new Date(p.deployedAt).toLocaleDateString()}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    testContract(p);
                  }}
                  disabled={
                    isTesting ||
                    !p.contractAddress ||
                    !p.abi ||
                    !hasExecuteWorkflowFunction(p.abi)
                  }
                  title={
                    !p.contractAddress || !p.abi
                      ? "Contract missing address or ABI data"
                      : !hasExecuteWorkflowFunction(p.abi)
                      ? "Contract missing executeWorkflow function - redeploy with updated AI prompt"
                      : "Execute the contract's executeWorkflow() function to test if it works and can send Telegram notifications"
                  }
                  className={`mt-4 px-4 py-2 border-none rounded-lg font-semibold transition-all ${
                    !p.contractAddress || !p.abi
                      ? "bg-muted cursor-not-allowed opacity-70 text-muted-foreground"
                      : !hasExecuteWorkflowFunction(p.abi)
                      ? "bg-orange-600 cursor-not-allowed opacity-70 text-white"
                      : isTesting
                      ? "bg-accent cursor-not-allowed opacity-70 text-accent-foreground"
                      : "bg-accent cursor-pointer hover:bg-accent/90 text-accent-foreground"
                  }`}
                >
                  {isTesting
                    ? "Testing..."
                    : !p.contractAddress || !p.abi
                    ? "Missing Data"
                    : !hasExecuteWorkflowFunction(p.abi)
                    ? "Need Redeploy"
                    : "🧪 Test Contract"}
                </button>
                {testResults[p.id] && (
                  <div
                    className={`mt-2 text-sm ${
                      testResults[p.id].success
                        ? "text-green-400"
                        : "text-destructive"
                    }`}
                  >
                    {testResults[p.id].message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Monitoring;
