import React from "react";
import { CTASection } from "./FeaturesCTA";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { motion, useInView } from "framer-motion";

const FeatureItem = ({ feature, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, {
    // Remove 'once: true' to allow re-triggering when element exits viewport
    margin: "-100px",
    amount: 0.3,
  });

  const transitionVariants = {
    item: {
      hidden: {
        opacity: 0.4,
        filter: "blur(12px)",
        y: 50,
        scale: 0.7,
      },
      visible: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          bounce: 0.3,
          duration: 1.2,
          delay: index * 0.02, // Stagger animation
        },
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={transitionVariants.item}
    >
      <CTASection
        number={index + 1}
        title={feature.title}
        description={feature.description}
        image="/screenshot.png"
        link="https://example.com"
        buttonText="Start Free Trial"
        layout={feature.layout}
      />
    </motion.div>
  );
};

export default function Features() {
  const features = [
    {
      title: "Flow-Based Visual Editors",
      description:
        "Experience intuitive smart contract development with our advanced flow-based visual editors. Design complex blockchain logic through drag-and-drop interfaces, making smart contract creation accessible to both developers and non-technical users. Our visual approach reduces development time by 70% while maintaining code quality and security standards.",
      layout: "left",
    },
    {
      title: "32+ Pre-Built Node Library",
      description:
        "Access an extensive library of over 32 specialized nodes covering everything from basic operations to advanced DeFi protocols. Each node is thoroughly tested, optimized for gas efficiency, and comes with comprehensive documentation. Build sophisticated smart contracts by simply connecting pre-validated components, ensuring reliability and reducing development risks.",
      layout: "right",
    },
    {
      title: "External API Integrations",
      description:
        "Seamlessly connect your smart contracts to real-world data and services through our robust external integration system. Support for popular APIs including price feeds, weather data, IoT sensors, and enterprise systems. Built-in authentication, rate limiting, and error handling ensure your contracts remain secure and performant in production environments.",
      layout: "left",
    },
    {
      title: "AI-Powered Prompt to Flowchart",
      description:
        "Transform natural language descriptions into professional flowcharts using our advanced AI engine. Simply describe your smart contract logic in plain English, and our AI will generate a comprehensive visual flowchart with proper node connections, error handling, and optimization suggestions. Perfect for rapid prototyping and client presentations.",
      layout: "right",
    },
    {
      title: "Flowchart to Solidity Compiler",
      description:
        "Automatically convert your visual flowcharts into production-ready Solidity code with our intelligent compiler. Our system generates clean, optimized, and well-documented smart contracts that follow industry best practices. Includes automatic gas optimization, security vulnerability detection, and compliance with the latest Solidity standards.",
      layout: "left",
    },
    {
      title: "Gas Optimization with Rust Modularization",
      description:
        "Leverage the power of Rust's memory safety and performance characteristics to create highly optimized smart contract modules. Our hybrid approach combines Solidity's ecosystem compatibility with Rust's efficiency, reducing gas costs by up to 40%. Perfect for high-frequency trading applications and complex DeFi protocols where every gas unit matters.",
      layout: "right",
    },
    {
      title: "Web-Accessible Development Environment",
      description:
        "Develop smart contracts from anywhere with our fully-featured web-based IDE. No installation required - access your projects through any modern browser with real-time collaboration features, cloud synchronization, and automatic backups. Includes integrated testing environments, debugging tools, and deployment pipelines for seamless development workflows.",
      layout: "left",
    },
    {
      title: "Intelligent Contract Optimization",
      description:
        "Automatically optimize your smart contracts for gas efficiency, security, and performance using our AI-powered analysis engine. Our system identifies redundant operations, suggests more efficient algorithms, and implements proven optimization patterns. Includes detailed reports showing potential savings and performance improvements.",
      layout: "right",
    },
    {
      title: "Smart Contract Templates & AI Code Generation",
      description:
        "Choose from hundreds of battle-tested smart contract templates covering DeFi, NFTs, DAOs, and enterprise use cases. Our AI assistant can generate custom Solidity code based on your specific requirements, complete with security audits, gas optimization, and comprehensive testing suites. Accelerate development with proven, production-ready foundations.",
      layout: "left",
    },
    {
      title: "Instant Auto-Save Technology",
      description:
        "Never lose your work with our advanced auto-save system that captures every change in real-time. Includes version history, branching capabilities, and conflict resolution for team collaboration. Your projects are automatically backed up to multiple secure locations with instant recovery options and rollback functionality.",
      layout: "right",
    },
    {
      title: "One-Click Instant Deployment",
      description:
        "Deploy your smart contracts to multiple blockchain networks with a single click. Our deployment system handles gas estimation, network configuration, and transaction monitoring automatically. Supports mainnet, testnets, and private networks with built-in verification, monitoring, and rollback capabilities for production-grade deployments.",
      layout: "left",
    },
    {
      title: "AssetHub Integration at Your Fingertips",
      description:
        "Seamlessly interact with Polkadot's AssetHub for cross-chain asset management and transfers. Our integrated interface provides direct access to asset creation, management, and cross-chain operations without leaving your development environment. Includes real-time asset tracking, automated compliance checks, and multi-signature support for enterprise use.",
      layout: "right",
    },
    {
      title: "Native Rust Contract Support & Instant Deployment",
      description:
        "Build and deploy Rust-based smart contracts with full ink! framework support and WebAssembly compilation. Our platform provides native Rust development tools, including cargo integration, comprehensive testing frameworks, and instant deployment to Polkadot parachains. Enjoy superior performance and memory safety with seamless integration into the Polkadot ecosystem.",
      layout: "left",
    },
  ];

  return (
    <div className="py-40 relative space-y-20 bg-black/40">
      {features.map((feature, index) => (
        <FeatureItem key={index} feature={feature} index={index} />
      ))}
    </div>
  );
}
