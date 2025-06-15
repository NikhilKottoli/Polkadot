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
import { ethers } from "ethers";
import WalletProfile from "./WalletProfile";

const ASSET_HUB_ABI = [
  "function createAsset(string name, string symbol, uint8 decimals) external returns (uint256)",
  "function mint(uint256 assetId, address to, uint256 amount) external",
  "function freeze(uint256 assetId, address account, bool freezeStatus) external",
  "function balanceOf(uint256 assetId, address account) external view returns (uint256)",
  "function isFrozen(uint256 assetId, address account) external view returns (bool)",
  "function assetInfo(uint256 assetId) external view returns (string, string, uint8, uint256)",
  "function assetCount() external view returns (uint256)",
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
      console.log("Connecting to wallet...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log("Provider:", provider);
      console.log("Signer:", signer);
      console.log("Address:", address);

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setConnected(true);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        ASSET_HUB_ABI,
        signer
      );
      setContract(contractInstance);

      // Load existing assets - using 1-based indexing like the working code
      const count = await contractInstance.assetCount();
      console.log("Asset count:", count.toString());
      const assets = [];
      for (let i = 1; i <= count; i++) {
        assets.push(i);
      }
      console.log("Existing assets:", assets);
      setExistingAssets(assets);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Error connecting to wallet");
    } finally {
      setLoading(false);
      console.log("Finished connectWallet");
    }
  };

  const handleFreeze = async () => {
    if (!contract || !freezeAssetId || !freezeAccount) return;

    try {
      setLoading(true);
      const tx = await contract.freeze(
        Number(freezeAssetId),
        freezeAccount,
        freezeStatus
      );
      await tx.wait();
      setContractTestResult(
        `✅ ${freezeStatus ? "Froze" : "Unfroze"} account ${truncateAddress(
          freezeAccount
        )} for Asset #${freezeAssetId}`
      );
      // Clear inputs after successful operation
      setFreezeAssetId("");
      setFreezeAccount("");
      setFreezeStatus(false);
    } catch (error) {
      console.error("Freeze error:", error);
      setContractTestResult(`❌ Error: ${error.message}`);
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
      setContractTestResult(
        `❌ Connection failed: ${err.reason || err.message}`
      );
    }
  };

  const truncateAddress = (addr) => {
    return addr ? `${addr.slice(0, 5)}...${addr.slice(-4)}` : "";
  };

  // Asset creation handler - fixed to properly update asset list
  const handleCreateAsset = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.createAsset(
        assetName,
        assetSymbol,
        assetDecimals
      );
      await tx.wait();

      // Refresh asset list properly
      const count = await contract.assetCount();
      const newAssets = [];
      for (let i = 1; i <= count; i++) {
        newAssets.push(i);
      }
      setExistingAssets(newAssets);

      // Clear form
      setAssetName("");
      setAssetSymbol("");
      setAssetDecimals(18);

      setContractTestResult(
        `✅ Asset created successfully! Total assets: ${count}`
      );
    } catch (e) {
      console.error("Error creating asset:", e);
      setContractTestResult(`❌ Error creating asset: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mint handler - simplified validation
  const handleMint = async () => {
    if (!contract || !existingAssets.includes(Number(mintAssetId))) {
      setContractTestResult("❌ Invalid or non-existing asset ID");
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.mint(mintAssetId, mintTo, mintAmount);
      await tx.wait();
      setContractTestResult(
        `✅ Successfully minted ${mintAmount} tokens to ${truncateAddress(
          mintTo
        )}`
      );

      // Clear form
      setMintAssetId("");
      setMintTo("");
      setMintAmount("");
    } catch (e) {
      console.error("Error minting:", e);
      setContractTestResult(`❌ Error minting: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Asset info fetch - simplified without complex BigInt conversions
  const fetchAssetInfo = async () => {
    try {
      if (!contract) {
        setContractTestResult("❌ Contract not initialized");
        return;
      }

      if (!existingAssets.includes(Number(infoAssetId))) {
        setContractTestResult("❌ Invalid asset ID");
        return;
      }

      setLoading(true);

      // Use the asset ID directly as it's 1-based in the working code
      const assetId = Number(infoAssetId);

      const [info, bal, isFrozen] = await Promise.all([
        contract.assetInfo(assetId),
        contract.balanceOf(assetId, account),
        contract.isFrozen(assetId, account),
      ]);

      setAssetInfo({
        name: info[0],
        symbol: info[1],
        decimals: Number(info[2]),
        totalSupply: info[3].toString(),
      });

      setBalance(bal.toString());
      setFrozen(isFrozen);
      setContractTestResult(`✅ Asset info fetched successfully`);
    } catch (e) {
      console.error("Error fetching asset info:", e);
      setAssetInfo(null);
      setBalance("");
      setFrozen(null);
      setContractTestResult(`❌ Error fetching asset info: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

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
                disabled={!contract}
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
