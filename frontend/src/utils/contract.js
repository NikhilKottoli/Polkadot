import { ethers } from "ethers";
import contractABI from "../contracts/XcmAssetReceiver.json";

const CONTRACT_ADDRESS = "0x4c0f921ceeea8b9e457fff610b9b4c3574806117";

export async function callOnXcmAssetReceived(assetId, amount, from) {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

  const tx = await contract.onXcmAssetReceived(assetId, amount, from);
  await tx.wait();
  return tx.hash;
}
