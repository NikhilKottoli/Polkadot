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
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateFlowchartFromPrompt,
  SAMPLE_PROMPTS,
} from "../../../../utils/aiService";
import useBoardStore from "../../../../store/store";

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

export default function ToolMenu({ setLoader }) {
  const sheetRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Debug aiInput changes
  useEffect(() => {
    console.log("📝 [AI] aiInput changed to:", aiInput);
    console.log("📝 [AI] aiInput length:", aiInput.length);
  }, [aiInput]);

  const { loadAIFlowchart, clearFlowchart } = useBoardStore();

  const handleAIGenerate = async () => {
    console.log("🎯 [AI] Starting generation process...");
    console.log("🎯 [AI] Input:", aiInput);
    console.log("🎯 [AI] Input length:", aiInput.trim().length);

    if (!aiInput.trim()) {
      console.warn("⚠️ [AI] Empty input provided");
      return;
    }

    console.log("🎯 [AI] Setting generating state to true");
    setIsGenerating(true);
    setAiError(null);

    // Use the setLoader prop to show global loading state
    setLoader(true);

    try {
      console.log("🤖 [AI] Calling generateFlowchartFromPrompt...");
      console.log("🤖 [AI] Prompt:", aiInput.trim());

      const result = await generateFlowchartFromPrompt(aiInput.trim());

      console.log("🎯 [AI] Generation result:", result);
      console.log("🎯 [AI] Result success:", result.success);

      if (result.success) {
        console.log("✅ [AI] Generation successful!");
        console.log("✅ [AI] Generated data:", result.data);
        console.log("✅ [AI] Nodes count:", result.data?.nodes?.length);
        console.log("✅ [AI] Edges count:", result.data?.edges?.length);

        // Load the generated flowchart
        console.log("🔄 [AI] Loading flowchart into store...");
        const loadResult = loadAIFlowchart(result.data);
        console.log("🔄 [AI] Load result:", loadResult);

        // Success feedback
        console.log("✅ [AI] Flowchart loaded successfully!");

        // Clear input and exit AI mode
        console.log("🧹 [AI] Cleaning up UI state...");
        setAiInput("");
        setIsAIMode(false);
      } else {
        // Handle AI generation failure
        console.error("❌ [AI] Generation failed:", result.error);
        console.log("🎯 [AI] Has fallback:", !!result.fallback);
        setAiError(result.error);

        // Load fallback if available
        if (result.fallback) {
          console.log("🔄 [AI] Loading fallback flowchart...");
          console.log("🔄 [AI] Fallback data:", result.fallback);
          loadAIFlowchart(result.fallback);
          setAiInput("");
          setIsAIMode(false);
        }
      }
    } catch (error) {
      console.error("❌ [AI] Unexpected error during generation:", error);
      console.error("❌ [AI] Error stack:", error.stack);
      setAiError("An unexpected error occurred. Please try again.");
    } finally {
      console.log("🎯 [AI] Setting generating state to false");
      setIsGenerating(false);
      // Hide the global loader
      setLoader(false);
    }
  };

  const handleAIExit = () => {
    console.log("🚪 [AI] Exiting AI mode");
    setAiInput("");
    setIsAIMode(false);
    setAiError(null);
    setIsGenerating(false);
  };

  const handleSamplePrompt = (prompt, event) => {
    console.log("💡 [AI] Sample prompt selected:", prompt);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setAiInput(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAIInputKeyDown = (e) => {
    console.log("⌨️ [AI] Key pressed:", e.key);
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("⌨️ [AI] Enter pressed - starting generation");
      handleAIGenerate();
    } else if (e.key === "Escape") {
      e.preventDefault();
      console.log("⌨️ [AI] Escape pressed - exiting");
      handleAIExit();
    }
  };

  // Handle clicks outside the component to exit AI mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("🖱️ [AI] Click detected, checking if outside container...");
      console.log("🖱️ [AI] Click target:", event.target);
      console.log("🖱️ [AI] Container ref exists:", !!containerRef.current);
      console.log("🖱️ [AI] AI mode active:", isAIMode);

      // Check if click is on AI-related elements
      const isClickOnAIElements =
        (containerRef.current && containerRef.current.contains(event.target)) ||
        event.target.closest("[data-ai-element]") ||
        event.target.classList.contains("bg-gradient-to-r") ||
        event.target.closest(".bg-gradient-to-r");

      console.log("🖱️ [AI] Click is on AI elements:", isClickOnAIElements);

      if (isAIMode && !isClickOnAIElements) {
        console.log("🖱️ [AI] Click was outside AI interface - exiting AI mode");
        handleAIExit();
      } else {
        console.log("🖱️ [AI] Click was on AI interface - staying in AI mode");
      }
    };

    if (isAIMode) {
      console.log("🖱️ [AI] Adding click outside listener");
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (isAIMode) {
        console.log("🖱️ [AI] Removing click outside listener");
      }
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
                width: "400px",
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
              className="flex flex-col gap-2 relative z-10"
            >
              <motion.div
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="flex items-center gap-3"
              >
                <Input
                  ref={inputRef}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleAIInputKeyDown}
                  placeholder="Describe your workflow..."
                  disabled={isGenerating}
                  className="bg-transparent border-pink-400/30 text-white placeholder:text-white/60 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 flex-1"
                />

                <motion.button
                  onClick={handleAIExit}
                  disabled={isGenerating}
                  className="p-2 hover:bg-pink-500/20 rounded-lg transition-colors duration-200 disabled:opacity-50 flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <X size={16} className="text-pink-400" />
                </motion.button>
              </motion.div>

              {/* Error Message */}
              {aiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-xs px-2"
                >
                  <AlertCircle size={12} />
                  <span>{aiError}</span>
                </motion.div>
              )}

              {/* Sample Prompts */}
              {!aiInput && !aiError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-2"
                >
                  <div className="text-xs text-pink-300/70 px-2">
                    Quick ideas:
                  </div>
                  <div className="flex flex-wrap gap-1 px-2">
                    {SAMPLE_PROMPTS.slice(0, 2).map((prompt, index) => (
                      <motion.button
                        key={index}
                        onClick={(event) => handleSamplePrompt(prompt, event)}
                        className="text-xs px-2 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded border border-pink-400/30 transition-colors flex-shrink-0"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        title={prompt}
                      >
                        {prompt.length > 30
                          ? prompt.substring(0, 30) + "..."
                          : prompt}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 px-2">
                    {SAMPLE_PROMPTS.slice(2, 4).map((prompt, index) => (
                      <motion.button
                        key={index + 2}
                        onClick={(event) => handleSamplePrompt(prompt, event)}
                        className="text-xs px-2 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded border border-pink-400/30 transition-colors flex-shrink-0"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        title={prompt}
                      >
                        {prompt.length > 30
                          ? prompt.substring(0, 30) + "..."
                          : prompt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
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
                  onClick={(e) => {
                    console.log("🎯 [AI] Generate button clicked");
                    console.log("🎯 [AI] Click event target:", e.target);
                    console.log("🎯 [AI] Is generating:", isGenerating);
                    console.log("🎯 [AI] AI Input:", aiInput);
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isGenerating) {
                      handleAIGenerate();
                    }
                  }}
                  data-ai-element="generate-button"
                  className={`bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 transition-all flex rounded-2xl justify-center items-center p-4 gap-2 shadow-lg border border-pink-400/30 relative overflow-hidden min-w-[80px] ${
                    isGenerating
                      ? "cursor-not-allowed opacity-75"
                      : "cursor-pointer"
                  }`}
                  whileHover={
                    isGenerating
                      ? {}
                      : {
                          scale: 1.05,
                          boxShadow: "0 0 25px rgba(236, 72, 153, 0.5)",
                        }
                  }
                  whileTap={isGenerating ? {} : { scale: 0.95 }}
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
                    animate={isGenerating ? { rotate: 360 } : { rotate: 360 }}
                    transition={
                      isGenerating
                        ? {
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }
                        : {
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                          }
                    }
                  >
                    {isGenerating ? (
                      <Loader2 className="text-white" size={20} />
                    ) : (
                      <Sparkle className="text-white" size={20} />
                    )}
                  </motion.div>
                  <motion.span
                    className="text-xs font-medium text-white/90"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
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
