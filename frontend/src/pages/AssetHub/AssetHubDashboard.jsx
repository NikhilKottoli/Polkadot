import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ethers } from "ethers";
import "./AssetHubDashboard.css";

const ASSET_HUB_ABI = [
  "function createAsset(string name, string symbol, uint8 decimals) external returns (uint256)",
  "function mint(uint256 assetId, address to, uint256 amount) external",
  "function freeze(uint256 assetId, address account, bool freezeStatus) external",
  "function balanceOf(uint256 assetId, address account) external view returns (uint256)",
  "function isFrozen(uint256 assetId, address account) external view returns (bool)",
  "function assetInfo(uint256 assetId) external view returns (string, string, uint8, uint256)",
  "function assetCount() external view returns (uint256)"
];

const CONTRACT_ADDRESS = "0xab6393232CbB3D3B38f6f1D33728f1de275E098b";


const AssetHubDashboard = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingAssets, setExistingAssets] = useState([]);
  const [contractTestResult, setContractTestResult] = useState(null);

  // Asset creation
  const [assetName, setAssetName] = useState("");
  const [assetSymbol, setAssetSymbol] = useState("");
  const [assetDecimals, setAssetDecimals] = useState(18);

  // Minting
  const [mintAssetId, setMintAssetId] = useState("");
  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("");

  // Freezing
  const [freezeAssetId, setFreezeAssetId] = useState("");
  const [freezeAccount, setFreezeAccount] = useState("");
  const [freezeStatus, setFreezeStatus] = useState(false);

  // Info
  const [infoAssetId, setInfoAssetId] = useState("");
  const [assetInfo, setAssetInfo] = useState(null);
  const [balance, setBalance] = useState("");
  const [frozen, setFrozen] = useState(null);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setConnected(true);
      
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ASSET_HUB_ABI, signer);
      setContract(contractInstance);
      
      // Load existing assets
      const count = await contractInstance.assetCount();
      const assets = [];
      for (let i = 1; i <= count; i++) {
        assets.push(i);
      }
      setExistingAssets(assets);
      
    } catch (error) {
      console.error("Connection error:", error);
      alert("Error connecting to wallet");
    } finally {
      setLoading(false);
    }
  };

  const testContractConnection = async () => {
    if (!contract) {
      setContractTestResult("Contract not initialized.");
      return;
    }
    try {
      // Try to call a simple view function
      const count = await contract.assetCount();
      setContractTestResult(`✅ Connected! assetCount = ${count.toString()}`);
    } catch (err) {
      setContractTestResult(`❌ Connection failed: ${err.reason || err.message}`);
    }
  };

  const truncateAddress = (addr) => {
    return addr ? `${addr.slice(0, 5)}...${addr.slice(-4)}` : "";
  };

  // Asset creation handler
  const handleCreateAsset = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.createAsset(assetName, assetSymbol, assetDecimals);
      await tx.wait();
      alert("Asset created!");
      // Refresh asset list
      const count = await contract.assetCount();
      setExistingAssets([...existingAssets, count]);
    } catch (e) {
      alert("Error creating asset: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Mint handler
  const handleMint = async () => {
    if (!contract || !existingAssets.includes(Number(mintAssetId))) {
      alert("Invalid or non-existing asset ID");
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.mint(mintAssetId, mintTo, mintAmount);
      await tx.wait();
      alert("Minted!");
    } catch (e) {
      alert("Error minting: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Asset info fetch
  const fetchAssetInfo = async () => {
    try {
      if (!contract) {
        alert("Contract not initialized");
        return;
      }

      // Convert to BigInt first to avoid mixing number types
      const assetId = BigInt(infoAssetId) - 1n; // Convert to BigInt and adjust for 0-based index
      const totalAssets = await contract.assetCount();
      const maxId = totalAssets - 1n; // Use BigInt subtraction
      console.log(`assetId: ${assetId}, maxId: ${maxId}`);
      if (assetId < 0n || assetId > maxId) {
        alert(`Invalid asset ID. Valid IDs: 0-${maxId}`);
        return;
      }

      setLoading(true);
      
      // Pass assetId as BigInt to contract calls
      const [info, bal, isFrozen] = await Promise.all([
        contract.assetInfo(assetId),
        contract.balanceOf(assetId, account),
        contract.isFrozen(assetId, account)
      ]);

      setAssetInfo({
        name: info[0],
        symbol: info[1],
        decimals: Number(info[2]),
        totalSupply: info[3].toString()
      });
      
      setBalance(bal.toString());
      setFrozen(isFrozen);

    } catch (e) {
      setAssetInfo(null);
      setBalance("");
      setFrozen(null);
      alert("Error fetching asset info: " + e.message);
    } finally {
      setLoading(false);
    }
  };


  if (!connected) {
    return (
      <div className="asset-hub-connect flex flex-col items-center justify-center h-screen">
        <h1 className="asset-hub-title">Welcome to Asset Hub</h1>
        <button 
          className="asset-hub-btn" 
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Connect Metamask"}
        </button>
      </div>
    );
  }

  return (
    <div className="asset-hub-dashboard">
      <div className="asset-hub-header">
        <h1>Asset Hub Dashboard</h1>
        <div className="asset-hub-account">
          Connected: {truncateAddress(account)}
        </div>
        <button
          className="asset-hub-btn"
          style={{ marginLeft: 16 }}
          onClick={testContractConnection}
          disabled={!contract}
        >
          Test Contract Connection
        </button>
      </div>
      {contractTestResult && (
        <div style={{ margin: "12px 0", color: contractTestResult.startsWith("✅") ? "green" : "red" }}>
          {contractTestResult}
        </div>
      )}

      <div className="asset-hub-section">
        <h2>Add New Asset</h2>
        <input 
          className="asset-hub-input" 
          placeholder="Name" 
          value={assetName} 
          onChange={e => setAssetName(e.target.value)}
          disabled={loading}
        />
        <input 
          className="asset-hub-input" 
          placeholder="Symbol" 
          value={assetSymbol} 
          onChange={e => setAssetSymbol(e.target.value)}
          disabled={loading}
        />
        <input 
          className="asset-hub-input" 
          type="number" 
          placeholder="Decimals" 
          value={assetDecimals} 
          onChange={e => setAssetDecimals(Number(e.target.value))}
          disabled={loading}
        />
        <button 
          className="asset-hub-btn" 
          onClick={handleCreateAsset}
          disabled={!assetName || !assetSymbol || loading}
        >
          {loading ? "Creating..." : "Create Asset"}
        </button>
      </div>

      <div className="asset-hub-section">
        <h2>Mint Existing Asset</h2>
        <select 
          className="asset-hub-input"
          value={mintAssetId}
          onChange={e => setMintAssetId(e.target.value)}
          disabled={loading || existingAssets.length === 0}
        >
          <option value="">Select Asset ID</option>
          {existingAssets.map(id => (
            <option key={id} value={id}>Asset #{id}</option>
          ))}
        </select>
        <input 
          className="asset-hub-input" 
          placeholder="Recipient" 
          value={mintTo} 
          onChange={e => setMintTo(e.target.value)}
          disabled={loading}
        />
        <input 
          className="asset-hub-input" 
          type="number" 
          placeholder="Amount" 
          value={mintAmount} 
          onChange={e => setMintAmount(e.target.value)}
          disabled={loading}
        />
        <button 
          className="asset-hub-btn" 
          onClick={handleMint}
          disabled={!mintAssetId || !mintTo || !mintAmount || loading}
        >
          {loading ? "Minting..." : "Mint"}
        </button>
      </div>

      <div className="asset-hub-section">
        <h2>Asset Information</h2>
        <select 
          className="asset-hub-input"
          value={infoAssetId}
          onChange={e => setInfoAssetId(e.target.value)}
          disabled={loading || existingAssets.length === 0}
        >
          <option value="">Select Asset ID</option>
          {existingAssets.map(id => (
            <option key={id} value={id}>Asset #{id}</option>
          ))}
        </select>
        <button 
          className="asset-hub-btn" 
          onClick={fetchAssetInfo}
          disabled={!infoAssetId || loading}
        >
          {loading ? "Fetching..." : "Get Info"}
        </button>
        
        {assetInfo && (
          <div className="asset-hub-info">
            <p><b>Name:</b> {assetInfo.name}</p>
            <p><b>Symbol:</b> {assetInfo.symbol}</p>
            <p><b>Decimals:</b> {assetInfo.decimals}</p>
            <p><b>Total Supply:</b> {assetInfo.totalSupply}</p>
            <p><b>Your Balance:</b> {balance}</p>
            <p><b>Your Frozen Status:</b> {frozen ? "❄️ Frozen" : "✅ Active"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetHubDashboard;
