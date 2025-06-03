import { CircleUser, Edit } from "lucide-react";

import { Sheet } from "@/components/ui/sheet";
import NodesSheet from "./Components/NodesSheet";
import ToolMenu from "./Components/ToolMenu";
import PropertiesBar from "./Components/PropertiesMenu";
import TopBar from "./Components/TopBar";

export default function Playground() {
  return (
    <div className="flex flex-1 flex-col  w-full h-screen p-2 bg-[#171717] ">
      <Sheet>
        <TopBar />
        <div className=" w-full h-full rounded-2xl border-[#2b2b2b] border bg-[#0e0e0e] relative bg-[radial-gradient(#3a3a3a_1px,transparent_1px)] [background-size:54px_54px]">
          {/* <div className="w-full h-screen "></div> */}

          <NodesSheet />
          <ToolMenu />
          <PropertiesBar />
        </div>
      </Sheet>
    </div>
  );
}
