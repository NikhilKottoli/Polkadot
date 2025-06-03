import { ethers } from "ethers";
import contractABI from "../contracts/XcmAssetReceiver.json";

const CONTRACT_ADDRESS = "0x169e90699bFFEBF1FF1BCAC5E8f415f5a1FF1d05";

export async function callOnXcmAssetReceived(assetId, amount, from) {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

  const tx = await contract.onXcmAssetReceived(assetId, amount, from);
  await tx.wait();
  return tx.hash;
}
