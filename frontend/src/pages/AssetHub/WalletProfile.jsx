import React, { useState, useEffect } from "react";

const WalletProfile = () => {
  const [walletData, setWalletData] = useState({
    address: "",
    balance: "0",
    chainId: "",
    isConnected: false,
    networkName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    setupEventListeners();

    // Set dark mode by default
    document.documentElement.setAttribute("data-theme", "dark");

    return () => {
      removeEventListeners();
    };
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          await updateWalletData(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const updateWalletData = async (address) => {
    setIsLoading(true);
    try {
      const [balance, chainId] = await Promise.all([
        window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        }),
        window.ethereum.request({
          method: "eth_chainId",
        }),
      ]);

      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      const chainIdNum = parseInt(chainId, 16);

      setWalletData({
        address,
        balance: balanceInEth.toFixed(4),
        chainId: chainIdNum,
        isConnected: true,
        networkName: getNetworkName(chainIdNum),
      });
    } catch (error) {
      console.error("Error updating wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);
    }
  };

  const removeEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      window.ethereum.removeListener("disconnect", handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      updateWalletData(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    const chainIdNum = parseInt(chainId, 16);
    setWalletData((prev) => ({
      ...prev,
      chainId: chainIdNum,
      networkName: getNetworkName(chainIdNum),
    }));
  };

  const handleDisconnect = () => {
    setWalletData({
      address: "",
      balance: "0",
      chainId: "",
      isConnected: false,
      networkName: "",
    });
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }

    try {
      setIsLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        await updateWalletData(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    handleDisconnect();
    alert(
      "Wallet disconnected. Please manually disconnect from MetaMask extension for complete logout."
    );
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletData.address);
      alert("Address copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: "Ethereum Mainnet",
      3: "Ropsten Testnet",
      4: "Rinkeby Testnet",
      5: "Goerli Testnet",
      11155111: "Sepolia Testnet",
      137: "Polygon Mainnet",
      80001: "Polygon Mumbai",
      56: "BSC Mainnet",
      97: "BSC Testnet",
      43114: "Avalanche Mainnet",
      43113: "Avalanche Fuji",
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  // Generate profile image URL from wallet address using Blockies or similar service
  const generateProfileImage = (address) => {
    if (!address) return "";
    // Using Blockies API to generate identicon from wallet address
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=1e293b,374151,4b5563&foregroundColor=ffffff`;
  };

  if (!walletData.isConnected) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-muted-foreground mb-6">
            Connect with MetaMask to access your wallet
          </p>

          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full rounded-lg bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-ring font-medium text-sm px-6 py-3 text-center inline-flex items-center justify-center text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-none  rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        {/* <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="text-center">
            <h3 className="text-lg font-semibold flex items-center justify-center">
              <span className="mr-2">🔗</span>
              Wallet Connected
            </h3>
          </div>
        </div> */}

        {/* Profile Image Section */}
        <div className="flex flex-col items-center mt-8 pb-6">
          <img
            src={generateProfileImage(walletData.address)}
            alt="Wallet Profile"
            className="w-24 h-24 rounded-full border-4 border-card shadow-lg bg-muted"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="w-24 h-24 rounded-full border-4 border-card shadow-lg hidden items-center justify-center text-primary-foreground font-bold text-xl bg-gradient-to-br from-primary to-primary/80">
            {walletData.address.slice(2, 4).toUpperCase()}
          </div>
        </div>

        {/* Balance Section */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-foreground mb-1">
              {walletData.balance} ETH
            </div>
            <div className="text-sm text-muted-foreground">Current Balance</div>
          </div>

          {/* Wallet Details */}
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Address
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  title="Copy address"
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-sm font-mono text-foreground break-all">
                {walletData.address}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Network
                </div>
                <div className="text-sm font-medium text-foreground">
                  {walletData.networkName}
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Chain ID
                </div>
                <div className="text-sm font-medium text-foreground">
                  {walletData.chainId}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => updateWalletData(walletData.address)}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            <button
              onClick={logout}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletProfile;
