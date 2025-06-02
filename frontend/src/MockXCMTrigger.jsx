import React from "react";
import { callOnXcmAssetReceived } from "./utils/contract";

function MockXcmTrigger() {
    const handleClick = async () => {
        try {
            // Replace with test values
            const assetId = "0x0000000000000000000000000000000000000000000000000000000000000001";
            const amount = 1000;
            const from = "0x8a84E3d8Fa00075FfA69010949dA38f63b7F5fB8"; // Or get from MetaMask
            const txHash = await callOnXcmAssetReceived(assetId, amount, from);
            alert(`Transaction sent! Hash: ${txHash}`);
        } catch (err) {
            alert(err.message);
        }
    };

    return <button onClick={handleClick}>Simulate XCM Asset Receipt</button>;
}

export default MockXcmTrigger;
