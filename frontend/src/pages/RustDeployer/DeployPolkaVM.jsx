import { ApiPromise, WsProvider } from "@polkadot/api";
import { useState } from "react";

const DeployPolkaVM = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [userAddress, setUserAddress] = useState("");

  // Connect wallet and get user address
  const connectWallet = async () => {
    try {
      if (!window.injectedWeb3?.polkadot) {
        throw new Error("Please install the Polkadot.js extension.");
      }
      const wallet = await window.injectedWeb3.polkadot.enable();
      const accounts = await wallet.accounts.get();
      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No accounts found. Please add an account to your wallet."
        );
      }
      setUserAddress(accounts[0].address);
      setDeployStatus(`Connected: ${accounts[0].address}`);
      return accounts[0].address;
    } catch (error) {
      setDeployStatus(`Wallet error: ${error.message}`);
      throw error;
    }
  };

  // Main deploy function
  const deployPolkaVM = async () => {
    try {
      setIsDeploying(true);
      setDeployStatus("Connecting wallet...");

      const address = await connectWallet();
      if (!address) return;

      setDeployStatus("Connecting to network...");
      const provider = new WsProvider(
        "wss://testnet-passet-hub-rpc.polkadot.io"
      );
      const api = await ApiPromise.create({ provider });

      setDeployStatus("Loading contract file...");
      const response = await fetch("/contracts/contract.polkavm");
      const blob = await response.blob();

      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          setDeployStatus("Deploying contract...");
          const blobData = e.target.result;

          // Convert blob to hex string
          const hexData = Array.from(new Uint8Array(blobData))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          // Create deployment transaction
          const tx = api.tx.contracts.instantiateWithCode(
            {}, // constructor data
            0, // value
            1000000000, // gas limit
            null, // storage deposit limit
            hexData // hex encoded bytecode
          );

          // Get signer from injected wallet
          const signer = window.injectedWeb3.polkadot.signer;
          if (!signer) {
            throw new Error(
              "No signer found. Please install Polkadot.js extension."
            );
          }

          await tx.signAndSend(address, { signer }, (result) => {
            if (result.status.isInBlock) {
              const events = result.events.filter(
                (e) => e.event.section === "contracts"
              );
              const instantiated = events.find(
                (e) => e.event.method === "Instantiated"
              );
              if (instantiated) {
                const newAddress = instantiated.event.data[1].toString();
                setContractAddress(newAddress);
                setDeployStatus("Contract deployed successfully!");
              }
            } else if (result.status.isFinalized) {
              setDeployStatus("Transaction finalized!");
            }
          });
        } catch (error) {
          setDeployStatus(`Deployment failed: ${error.message}`);
        }
      };
      fileReader.readAsArrayBuffer(blob);
    } catch (error) {
      setDeployStatus(`Error: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="deploy-container p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Deploy PolkaVM Contract</h2>
      <button
        onClick={deployPolkaVM}
        disabled={isDeploying}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isDeploying ? "Deploying..." : "Deploy Contract"}
      </button>
      {userAddress && (
        <p className="mt-2 text-sm text-gray-500">Wallet: {userAddress}</p>
      )}
      {deployStatus && (
        <p className="mt-4 p-3 bg-gray-100 rounded">{deployStatus}</p>
      )}
      {contractAddress && (
        <p className="mt-4 p-3 bg-green-100 rounded">
          Contract Address: {contractAddress}
        </p>
      )}
    </div>
  );
};

export default DeployPolkaVM;
