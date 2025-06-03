import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import {
  MousePointer2,
  MessageSquarePlus,
  Hand,
  Sparkle,
  Plus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const menuButtons = [
  {
    icon: <MousePointer2 />,
    label: "Select Node",
    shortcut: "Ctrl+V",
    keyCombo: (e) => e.ctrlKey && e.key === "v",
    onClick: () => console.log("Select Node"),
  },
  {
    icon: <MessageSquarePlus />,
    label: "Add Comment",
    shortcut: "Ctrl+T",
    keyCombo: (e) => e.key.toLowerCase() === "t",
    onClick: () => console.log("Add Comment"),
  },
  {
    icon: <Hand />,
    label: "Drag Canvas",
    shortcut: "ctrl+H",
    keyCombo: (e) => e.key.toLowerCase() === "h",
    onClick: () => console.log("Drag Canvas"),
  },
  {
    icon: <Sparkle />,
    label: "AI Assistant",
    shortcut: "Ctrl+I",
    keyCombo: (e) => e.ctrlKey && e.key.toLowerCase() === "i",
    onClick: () => console.log("AI Assistant"),
  },
];

export default function ToolMenu() {
  const sheetRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        sheetRef.current?.click();
        return;
      }

      for (const btn of menuButtons) {
        if (btn.keyCombo?.(e)) {
          e.preventDefault();
          btn.onClick();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute w-full h-[100px] flex items-center justify-center bottom-4 left-0 right-0 z-50 gap-4">
      <div className="rounded-2xl border border-white/10 bg-[#171717]/60 backdrop-blur-md shadow-md p-4 flex items-center justify-center gap-4">
        {menuButtons.map((btn, i) => (
          <MenuButton
            key={i}
            Icon={btn.icon}
            label={btn.label}
            shortcut={btn.shortcut}
            onClick={btn.onClick}
          />
        ))}
      </div>

      {/* Add Node Sheet Trigger Button */}
      <Tooltip className="z-50" delayDuration={500}>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <div
              ref={sheetRef}
              className="bg-[#7e0058] hover:bg-[#7e006d] transition-colors flex flex-col rounded-2xl justify-center items-center p-4 gap-2 shadow-lg border border-white/10 cursor-pointer"
            >
              <Plus />
            </div>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent className="bg-[#171717] text-white p-2 rounded-lg shadow-lg border border-white/10">
          <p className="text-sm flex items-center gap-2">
            Add Node <Badge variant="outline">/</Badge>
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function MenuButton({ Icon, label, onClick, shortcut }) {
  return (
    <Tooltip className="z-50" delayDuration={500}>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className="hover:bg-[#333333] w-12 transition-colors flex justify-center items-center rounded-xl cursor-pointer"
          style={{ aspectRatio: 1 }}
        >
          {Icon}
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-[#171717] text-white p-2 rounded-lg shadow-lg border border-white/10">
        <p className="text-sm flex items-center gap-2">
          {label} <Badge variant="outline">{shortcut}</Badge>
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
