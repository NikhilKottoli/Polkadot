import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import WalletProfile from "./WalletProfile";

const CONTRACT_ADDRESS = "0x4AC7C7DceA064e7A5A30aB4a4B876e80D1F02490";
const BACKEND_URL = "http://localhost:3000";

const AssetHubDashboard = () => {
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

  // Load all assets (since backend creates all assets)
  const loadAllAssets = async () => {
    try {
      console.log("Loading all assets...");
      const response = await fetch(`${BACKEND_URL}/api/getNextAssetId/${CONTRACT_ADDRESS}`);
      const result = await response.json();
      
      if (result.success) {
        // Create array of all asset IDs from 0 to nextAssetId-1
        const allAssets = [];
        for (let i = 0; i < result.nextAssetId; i++) {
          allAssets.push(i);
        }
        setExistingAssets(allAssets);
        console.log("Loaded assets:", allAssets);
      } else {
        console.error("Failed to load assets:", result.error);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      console.log("Connecting to wallet...");
      
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const address = accounts[0];
      setAccount(address);
      setConnected(true);
      
      console.log("Connected to:", address);
      
      // Load all assets after connecting
      await loadAllAssets();
      
    } catch (error) {
      console.error("Connection error:", error);
      alert("Error connecting to wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async () => {
    if (!freezeAssetId || !freezeAccount) return;

    try {
      setLoading(true);
      const endpoint = freezeStatus ? 'freezeAccount' : 'unfreezeAccount';
      const response = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: freezeAssetId,
          account: freezeAccount,
          contractAddress: CONTRACT_ADDRESS
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setContractTestResult(`✅ Account ${freezeStatus ? 'frozen' : 'unfrozen'} successfully! TX: ${result.transactionHash}`);
        // Clear form
        setFreezeAssetId("");
        setFreezeAccount("");
        setFreezeStatus(false);
      } else {
        setContractTestResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Freeze error:", error);
      setContractTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testContractConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/getNextAssetId/${CONTRACT_ADDRESS}`);
      const result = await response.json();
      
      if (result.success) {
        setContractTestResult(`✅ Connected! Next Asset ID = ${result.nextAssetId}`);
      } else {
        setContractTestResult(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      setContractTestResult(`❌ Connection failed: ${error.message}`);
    }
  };

  const truncateAddress = (addr) => {
    return addr ? `${addr.slice(0, 5)}...${addr.slice(-4)}` : "";
  };

  // Asset creation handler
  const handleCreateAsset = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/createAsset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: assetName,
          symbol: assetSymbol,
          decimals: assetDecimals,
          contractAddress: CONTRACT_ADDRESS
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setContractTestResult(`✅ Asset created successfully! TX: ${result.transactionHash}`);
        // Refresh asset list
        await loadAllAssets();
        // Clear form
        setAssetName("");
        setAssetSymbol("");
        setAssetDecimals(18);
      } else {
        setContractTestResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setContractTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mint handler
  const handleMint = async () => {
    if (!existingAssets.includes(Number(mintAssetId))) {
      setContractTestResult("❌ Invalid or non-existing asset ID");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/mintAsset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: mintAssetId,
          to: mintTo,
          amount: mintAmount,
          contractAddress: CONTRACT_ADDRESS
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setContractTestResult(`✅ Successfully minted ${result.amount} tokens! TX: ${result.transactionHash}`);
        // Clear form
        setMintAssetId("");
        setMintTo("");
        setMintAmount("");
      } else {
        setContractTestResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setContractTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Asset info fetch
  const fetchAssetInfo = async () => {
    try {
      setLoading(true);
      
      const [assetResponse, balanceResponse, frozenResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/getAsset/${CONTRACT_ADDRESS}/${infoAssetId}`),
        fetch(`${BACKEND_URL}/api/getBalance/${CONTRACT_ADDRESS}/${infoAssetId}/${account}`),
        fetch(`${BACKEND_URL}/api/isAccountFrozen/${CONTRACT_ADDRESS}/${infoAssetId}/${account}`)
      ]);

      const [assetResult, balanceResult, frozenResult] = await Promise.all([
        assetResponse.json(),
        balanceResponse.json(),
        frozenResponse.json()
      ]);

      if (assetResult.success && balanceResult.success && frozenResult.success) {
        setAssetInfo(assetResult.asset);
        setBalance(balanceResult.balance);
        setFrozen(frozenResult.isFrozen);
        setContractTestResult(`✅ Asset info fetched successfully`);
      } else {
        setContractTestResult(`❌ Error fetching asset info`);
      }
    } catch (error) {
      setContractTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load assets when connected
  useEffect(() => {
    if (connected) {
      loadAllAssets();
    }
  }, [connected]);

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Welcome to Asset Hub
            </CardTitle>
            <CardDescription>
              Connect your wallet to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={connectWallet}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? "Connecting..." : "Connect MetaMask"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container m-6 bg-black rounded-2xl mt-4 flex pt-16 overflow-hidden h-screen">
      {/* Sticky WalletProfile */}
      <div className="sticky top-0 self-start pl-20">
        <WalletProfile />
      </div>

      <div className="w-full max-w-[900px] h-full overflow-y-auto space-y-6 mx-auto mb-32">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Asset Hub Dashboard</CardTitle>
                <CardDescription>
                  Connected:{" "}
                  <Badge variant="secondary">{truncateAddress(account)}</Badge>
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={testContractConnection}
              >
                Test Contract
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Contract Test Result */}
        {contractTestResult && (
          <Alert
            variant={
              contractTestResult.startsWith("✅") ? "default" : "destructive"
            }
          >
            <AlertDescription>{contractTestResult}</AlertDescription>
          </Alert>
        )}

        {/* Create Asset Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Asset</CardTitle>
            <CardDescription>
              Deploy a new token to the Asset Hub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Name</label>
                <Input
                  placeholder="e.g., My Token"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Symbol</label>
                <Input
                  placeholder="e.g., MTK"
                  value={assetSymbol}
                  onChange={(e) => setAssetSymbol(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Decimals</label>
              <Input
                type="number"
                placeholder="18"
                value={assetDecimals}
                onChange={(e) => setAssetDecimals(Number(e.target.value))}
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleCreateAsset}
              disabled={!assetName || !assetSymbol || loading}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Asset"}
            </Button>
          </CardContent>
        </Card>

        {/* Mint Asset Section */}
        <Card>
          <CardHeader>
            <CardTitle>Mint Tokens</CardTitle>
            <CardDescription>Mint tokens to any address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset</label>
              <Select
                value={mintAssetId}
                onValueChange={setMintAssetId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {existingAssets.map((id) => (
                    <SelectItem key={id} value={id.toString()}>
                      Asset #{id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Address</label>
              <Input
                placeholder="0x..."
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="1000"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleMint}
              disabled={!mintAssetId || !mintTo || !mintAmount || loading}
              className="w-full"
            >
              {loading ? "Minting..." : "Mint Tokens"}
            </Button>
          </CardContent>
        </Card>

        {/* Freeze/Unfreeze Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Freeze or unfreeze accounts for specific assets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset</label>
                <Select
                  value={freezeAssetId}
                  onValueChange={setFreezeAssetId}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingAssets.map((id) => (
                      <SelectItem key={id} value={id.toString()}>
                        Asset #{id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Address</label>
                <Input
                  placeholder="0x..."
                  value={freezeAccount}
                  onChange={(e) => setFreezeAccount(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="freeze-status"
                checked={freezeStatus}
                onCheckedChange={setFreezeStatus}
                disabled={loading}
              />
              <label htmlFor="freeze-status" className="text-sm font-medium">
                Freeze Account
              </label>
            </div>
            <Button
              onClick={handleFreeze}
              disabled={!freezeAssetId || !freezeAccount || loading}
              variant={freezeStatus ? "destructive" : "default"}
              className="w-full"
            >
              {loading
                ? "Updating..."
                : freezeStatus
                ? "Freeze Account"
                : "Unfreeze Account"}
            </Button>
          </CardContent>
        </Card>

        {/* Asset Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
            <CardDescription>
              View detailed information about your assets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Asset</label>
                <Select
                  value={infoAssetId}
                  onValueChange={setInfoAssetId}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingAssets.map((id) => (
                      <SelectItem key={id} value={id.toString()}>
                        Asset #{id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={fetchAssetInfo}
                disabled={!infoAssetId || loading}
                className="self-end"
              >
                {loading ? "Fetching..." : "Get Info"}
              </Button>
            </div>

            {assetInfo && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Name:
                      </span>
                      <span className="text-sm font-mono">
                        {assetInfo.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Symbol:
                      </span>
                      <Badge variant="outline">{assetInfo.symbol}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Decimals:
                      </span>
                      <span className="text-sm">{assetInfo.decimals}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Total Supply:
                      </span>
                      <span className="text-sm font-mono">
                        {assetInfo.totalSupply}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Your Balance:
                      </span>
                      <span className="text-sm font-mono">{balance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Status:
                      </span>
                      <Badge variant={frozen ? "destructive" : "default"}>
                        {frozen ? "❄️ Frozen" : "✅ Active"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetHubDashboard;
