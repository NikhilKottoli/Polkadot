// components/FileIcons.jsx
import React from "react";
import {
  RiBracesLine,
  RiCodeSSlashLine,
  RiFileLine,
  RiFileTextLine,
  RiImageLine,
  RiReactjsLine,
  RiSettings3Line,
  RiShieldLine,
  RiCoinLine,
  RiDatabase2Line,
  RiGitBranchLine,
  RiTerminalBoxLine,
} from "@remixicon/react";

export function getWeb3FileIcon(extension = "", fileName = "", className = "") {
  const ext = extension.toLowerCase();
  const name = fileName.toLowerCase();

  // Web3 specific files
  if (ext === "sol")
    return <RiShieldLine className={`${className} text-blue-500`} />;
  if (ext === "vy" || ext === "vyper")
    return <RiShieldLine className={`${className} text-green-500`} />;
  if (ext === "cairo")
    return <RiShieldLine className={`${className} text-orange-500`} />;
  if (ext === "move")
    return <RiShieldLine className={`${className} text-purple-500`} />;
  if (ext === "rs" && name.includes("contract"))
    return <RiShieldLine className={`${className} text-red-500`} />;

  // Config files
  if (name === "hardhat.config.js" || name === "hardhat.config.ts")
    return <RiSettings3Line className={`${className} text-yellow-500`} />;
  if (name === "truffle-config.js" || name === "truffle.js")
    return <RiSettings3Line className={`${className} text-brown-500`} />;
  if (name === "foundry.toml")
    return <RiSettings3Line className={`${className} text-red-500`} />;
  if (name === "anchor.toml")
    return <RiSettings3Line className={`${className} text-purple-500`} />;

  // Package managers and dependencies
  if (name === "package.json" && fileName.includes("web3"))
    return <RiCoinLine className={`${className} text-green-500`} />;
  if (name === "cargo.toml")
    return <RiDatabase2Line className={`${className} text-orange-500`} />;

  // Migration and deployment files
  if (name.includes("migration") || name.includes("deploy"))
    return <RiGitBranchLine className={`${className} text-blue-500`} />;

  // Test files
  if (name.includes("test") && (ext === "js" || ext === "ts" || ext === "sol"))
    return <RiTerminalBoxLine className={`${className} text-green-400`} />;

  // Standard file types
  switch (ext) {
    case "tsx":
    case "jsx":
      return <RiReactjsLine className={`${className} text-cyan-500`} />;
    case "ts":
      return <RiCodeSSlashLine className={`${className} text-blue-500`} />;
    case "js":
    case "mjs":
      return <RiCodeSSlashLine className={`${className} text-yellow-500`} />;
    case "json":
      return <RiBracesLine className={`${className} text-yellow-600`} />;
    case "toml":
    case "yaml":
    case "yml":
      return <RiSettings3Line className={`${className} text-purple-500`} />;
    case "svg":
    case "ico":
    case "png":
    case "jpg":
      return <RiImageLine className={`${className} text-pink-500`} />;
    case "md":
      return <RiFileTextLine className={`${className} text-blue-400`} />;
    case "rs":
      return <RiCodeSSlashLine className={`${className} text-red-500`} />;
    default:
      return <RiFileLine className={className} />;
  }
}

export const FileIcon = ({ extension, fileName, className }) => {
  return getWeb3FileIcon(extension, fileName, className);
};
