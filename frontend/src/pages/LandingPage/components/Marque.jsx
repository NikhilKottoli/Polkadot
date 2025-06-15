"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  Zap,
  Link,
  Lightbulb,
  FileText,
  Settings,
  Globe,
  Target,
  Bot,
  Save,
  MousePointer,
  Gem,
  Wrench,
  Code,
} from "lucide-react";

const CoolMarquee = () => {
  const textStrings = [
    { icon: Rocket, text: "FLOW BASED EDITORS" },
    { icon: Zap, text: "32+ NODES AVAILABLE" },
    { icon: Link, text: "EXTERNAL INTEGRATIONS" },
    { icon: Lightbulb, text: "PROMPT TO FLOWCHART" },
    { icon: FileText, text: "FLOWCHART TO SOLIDITY" },
    { icon: Settings, text: "RUST MODULARISATION" },
    { icon: Globe, text: "WEB ACCESSIBLE EDITOR" },
    { icon: Target, text: "CONTRACT OPTIMIZATION" },
    { icon: Bot, text: "AI TO SOLIDITY" },
    { icon: Save, text: "INSTANT SAVE" },
    { icon: MousePointer, text: "ONE CLICK DEPLOY" },
    { icon: Gem, text: "ASSETHUB INTEGRATION" },
    { icon: Wrench, text: "RUST DEPLOYMENTS" },
    { icon: Gem, text: "POLKADOT ECOSYSTEM" },
    { icon: Code, text: "SMART CONTRACTS" },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-background py-8 border-t border-b border-border">
      {/* Main marquee container */}
      <div className="flex space-x-8">
        {/* First scrolling row */}
        <motion.div
          className="flex space-x-8 whitespace-nowrap"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {[...textStrings, ...textStrings].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-4 rounded-full border border-primary/20 bg-card/50 px-6 py-3 backdrop-blur-sm"
              >
                <IconComponent size={20} className="text-primary" />
                <span className="text-xl font-bold tracking-wider text-primary">
                  {item.text}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Second scrolling row for seamless loop */}
        <motion.div
          className="flex space-x-8 whitespace-nowrap"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {[...textStrings, ...textStrings].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={`second-${index}`}
                className="flex items-center space-x-4 rounded-full border-2 border-accent bg-card/30 px-6 py-3 backdrop-blur-sm"
              >
                <IconComponent
                  size={22}
                  className="text-[#f08eef]"
                  color="#f08eef"
                />
                <span className="text-2xl font-bold tracking-wider text-accent-foreground">
                  {item.text}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom decorative marquee with smaller text */}
      <div className="mt-4 flex">
        <motion.div
          className="flex space-x-6 whitespace-nowrap"
          animate={{
            x: [-1000, 0],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 18,
              ease: "linear",
            },
          }}
        >
          {[...textStrings.slice(0, 8), ...textStrings.slice(0, 8)].map(
            (item, index) => (
              <span
                key={`bottom-${index}`}
                className="text-sm font-medium text-muted-foreground/60"
              >
                {item.text} •
              </span>
            )
          )}
        </motion.div>

        <motion.div
          className="flex space-x-6 whitespace-nowrap"
          animate={{
            x: [-1000, 0],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 18,
              ease: "linear",
            },
          }}
        >
          {[...textStrings.slice(8), ...textStrings.slice(8)].map(
            (item, index) => (
              <span
                key={`bottom-second-${index}`}
                className="text-sm font-medium text-muted-foreground/60"
              >
                {item.text} •
              </span>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CoolMarquee;
