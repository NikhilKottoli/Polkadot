import NodePalette from "./components/LayoutComponents/PropertiesMenu";
import { Sheet } from "@/components/ui/sheet";
import NodesSheet from "./components/LayoutComponents/NodesSheet";
import ToolMenu from "./components/LayoutComponents/ToolMenu";
import TopBar from "./components/LayoutComponents/TopBar";
import FlowBoard from "./components/Board/FlowBoard";

export default function Playground() {
  return (
    <div className="flex flex-1 flex-col  w-full h-screen p-2 bg-[#171717] ">
      <Sheet>
        <TopBar />
        <div className=" w-full h-full rounded-2xl border-[#2b2b2b] border bg-[#0e0e0e] relative overflow-hidden ">
          <FlowBoard />
        </div>
      </Sheet>
    </div>
  );
}
