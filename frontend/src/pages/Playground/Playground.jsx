import NodePalette from "./components/LayoutComponents/PropertiesMenu";
import { Sheet } from "@/components/ui/sheet";
import NodesSheet from "./components/LayoutComponents/NodesSheet";
import ToolMenu from "./components/LayoutComponents/ToolMenu";
import TopBar from "./components/LayoutComponents/TopBar";
import FlowBoard from "./components/Board/FlowBoard";
import { useState } from "react";



export default function Playground() {
  const [walletAddress, setWalletAddress] = useState('');
  return (
    <div className="flex flex-1 flex-col  w-full h-screen p-2 bg-[#171717] ">
      <Sheet>
        <TopBar walletAddress={walletAddress} setWalletAddress={setWalletAddress}/>
        <div className=" w-full h-full rounded-2xl border-[#2b2b2b] border bg-[#0e0e0e] relative overflow-hidden ">
          <FlowBoard walletAddress={walletAddress} />
        </div>
      </Sheet>
    </div>
  );
}
