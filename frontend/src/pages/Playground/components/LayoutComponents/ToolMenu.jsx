import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import {
  MousePointer2,
  MessageSquarePlus,
  Hand,
  Sparkle,
  Plus,
  X,
  Send,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

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
    keyCombo: (e) => e.ctrlKey && e.key.toLowerCase() === "t",
    onClick: () => console.log("Add Comment"),
  },
  {
    icon: <Hand />,
    label: "Drag Canvas",
    shortcut: "ctrl+H",
    keyCombo: (e) => e.ctrlKey && e.key.toLowerCase() === "h",
    onClick: () => console.log("Drag Canvas"),
  },
  {
    icon: <Sparkle />,
    label: "AI Assistant",
    shortcut: "Ctrl+I",
    keyCombo: (e) => e.ctrlKey && e.key.toLowerCase() === "i",
    onClick: null,
  },
];

export default function ToolMenu() {
  const sheetRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiInput, setAiInput] = useState("");

  const handleAIGenerate = () => {
    console.log("AI Generate:", aiInput);
    // Dummy function for AI generation
    // Add your AI generation logic here
    setAiInput("");
  };

  const handleAIExit = () => {
    setAiInput("");
    setIsAIMode(false);
  };

  const handleAIInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAIGenerate();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleAIExit();
    }
  };

  // Handle clicks outside the component to exit AI mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isAIMode &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        handleAIExit();
      }
    };

    if (isAIMode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAIMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAIMode) return;

      if (e.key === "/") {
        e.preventDefault();
        sheetRef.current?.click();
        return;
      }

      for (const btn of menuButtons) {
        if (btn.keyCombo?.(e)) {
          e.preventDefault();
          if (btn.label === "AI Assistant") {
            setIsAIMode(true);
          } else {
            btn.onClick();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAIMode]);

  // Auto-focus input when entering AI mode
  useEffect(() => {
    if (isAIMode && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 150);
    }
  }, [isAIMode]);

  return (
    <div className="absolute w-full h-[100px] flex items-center justify-center bottom-8 left-0 right-0 z-50 gap-4 pb-[50px]">
      <motion.div
        ref={containerRef}
        className="relative rounded-2xl border border-white/10 bg-[#171717]/60 backdrop-blur-md shadow-md p-4 flex items-center justify-center gap-4"
        animate={
          isAIMode
            ? {
                scale: 1.02,
                boxShadow: "0 0 30px rgba(236, 72, 153, 0.3)",
              }
            : {
                scale: 1,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }
        }
        transition={{
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {/* Enhanced glowing border for AI mode */}
        <AnimatePresence>
          {isAIMode && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                background: [
                  "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1))",
                  "linear-gradient(90deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2))",
                  "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1))",
                ],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                background: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isAIMode ? (
            <motion.div
              key="ai-input"
              initial={{ opacity: 0, width: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                width: "320px",
                scale: 1,
              }}
              exit={{
                opacity: 0,
                width: 0,
                scale: 0.8,
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="flex items-center gap-3 relative z-10"
            >
              <motion.div
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="flex items-center gap-3 flex-1"
              >
                <Input
                  ref={inputRef}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleAIInputKeyDown}
                  placeholder="Ask AI anything..."
                  className="bg-transparent border-pink-400/30 text-white placeholder:text-white/60 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                />
                <motion.button
                  onClick={handleAIExit}
                  className="p-2 hover:bg-pink-500/20 rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <X size={16} className="text-pink-400" />
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="menu-buttons"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="flex items-center gap-4"
            >
              {menuButtons.map((btn, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.3,
                  }}
                >
                  <MenuButton
                    Icon={btn.icon}
                    label={btn.label}
                    shortcut={btn.shortcut}
                    onClick={
                      btn.label === "AI Assistant"
                        ? () => setIsAIMode(true)
                        : btn.onClick
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced Add Node / AI Generate Button */}
      <AnimatePresence mode="wait">
        {isAIMode ? (
          <motion.div
            key="ai-generate"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{
              scale: 1,
              rotate: 0,
              opacity: 1,
            }}
            exit={{
              scale: 0,
              rotate: 90,
              opacity: 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Tooltip className="z-50" delayDuration={300}>
              <TooltipTrigger asChild>
                <motion.div
                  onClick={handleAIGenerate}
                  className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 transition-all flex  rounded-2xl justify-center items-center p-4 gap-2 shadow-lg border border-pink-400/30 cursor-pointer relative overflow-hidden min-w-[80px] "
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 25px rgba(236, 72, 153, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(236, 72, 153, 0.4)",
                      "0 0 30px rgba(236, 72, 153, 0.6)",
                      "0 0 20px rgba(236, 72, 153, 0.4)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkle className="text-white" size={20} />
                  </motion.div>
                  <motion.span
                    className="text-xs font-medium text-white/90"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Generate
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#171717] text-white p-2 rounded-lg shadow-lg border border-white/10">
                <p className="text-sm flex items-center gap-2">
                  Generate <Badge variant="outline">Enter</Badge>
                </p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ) : (
          <motion.div
            key="add-node"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Tooltip className="z-50" delayDuration={300}>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <motion.div
                    ref={sheetRef}
                    className="bg-[#7e0058] hover:bg-[#7e006d] transition-colors flex flex-col rounded-2xl justify-center items-center p-4 gap-2 shadow-lg border border-white/10 cursor-pointer"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 8px 25px rgba(126, 0, 88, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={20} />
                  </motion.div>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent className="bg-[#171717] text-white p-2 rounded-lg shadow-lg border border-white/10">
                <p className="text-sm flex items-center gap-2">
                  Add Node <Badge variant="outline">/</Badge>
                </p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ Icon, label, onClick, shortcut }) {
  return (
    <Tooltip className="z-50" delayDuration={300}>
      <TooltipTrigger asChild>
        <motion.div
          onClick={onClick}
          className="hover:bg-[#333333] w-12 transition-colors flex justify-center items-center rounded-xl cursor-pointer"
          style={{ aspectRatio: 1 }}
          whileHover={{
            scale: 1.1,
            backgroundColor: "rgba(51, 51, 51, 0.8)",
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          {Icon}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="bg-[#171717] text-white p-2 rounded-lg shadow-lg border border-white/10">
        <p className="text-sm flex items-center gap-2">
          {label} <Badge variant="outline">{shortcut}</Badge>
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
