import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NodesSheet() {
  return (
    <SheetContent
      side="left"
      className="w-[400px] border border-white/10 bg-[#171717]/60 backdrop-blur-md "
    >
      <SheetHeader>
        <SheetTitle>
          <div className="flex items-center gap-2 ">
            <img className="" src="/logo.svg" />
            <p className="font-bold">Polkaflow</p>
          </div>
        </SheetTitle>
        <SheetDescription className="mt-4">
          Add Diffrent types of nodes , Triggers ,Actions and Conditional Blocks
        </SheetDescription>
      </SheetHeader>
      <div className="grid flex-1 auto-rows-min gap-6 px-4">
        <div className="grid gap-3">
          <Input id="sheet-demo-username" placeholder="Search Nodes" />
        </div>
      </div>


<div>


    ///add grid of diffrent tyeps on nodes store them in a n object there should be 2 columns in a row it should be searchable and nodes should appear graphically
</div>

      <SheetFooter></SheetFooter>
    </SheetContent>
  );
}
