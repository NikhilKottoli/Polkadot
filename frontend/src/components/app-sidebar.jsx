import * as React from "react";
import { useState, useEffect } from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconEyeBitcoin,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInfoCircle,
  IconInfoCircleFilled,
  IconInnerShadowTop,
  IconListDetails,
  IconMoneybag,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Default data structure
const defaultData = {
  user: {
    name: "Connect Wallet",
    email: "Not connected",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Monitoring",
      url: "/monitoring",
      icon: IconInnerShadowTop,
    },
    {
      title: "Editor",
      url: "/editor",
      icon: IconDatabase,
    },
    {
      title: "Solidity generator",
      url: "/solidity-generator",
      icon: IconFileAi,
    },
  ],
  navClouds: [
    {
      title: "Workflows",
      icon: IconListDetails,
      isActive: true,
      url: "#",
      items: [
        { title: "Active Workflows", url: "#" },
        { title: "Archived Workflows", url: "#" },
      ],
    }
  ],
  secondary: [
    {
      name: "About Us",
      url: "/",
      icon: IconInfoCircle,
    },
    {
      name: "Future Plans",
      url: "/future",
      icon: IconReport,
    },
    {
      name: "Free DOT",
      url: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
      icon: IconEyeBitcoin,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const [userData, setUserData] = useState(defaultData.user);
  const [isConnecting, setIsConnecting] = useState(false);

  // Function to connect to wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask or another Web3 wallet!');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        
        // Get network info
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });

        // Get balance
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });

        // Convert balance from wei to ETH
        const balanceInETH = parseInt(balance, 16) / Math.pow(10, 18);

        // Generate user data
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        const networkName = getNetworkName(chainId);
        
        setUserData({
          name: shortAddress,
          email: `${networkName} • ${balanceInETH.toFixed(4)} ETH`,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
          address: address,
          balance: balanceInETH,
          chainId: chainId
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Function to get network name from chain ID
  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum',
      '0x89': 'Polygon',
      '0x38': 'BSC',
      '0xa': 'Optimism',
      '0xa4b1': 'Arbitrum',
      '0xaa36a7': 'Sepolia',
      '0x13881': 'Mumbai'
    };
    return networks[chainId] || 'Unknown Network';
  };

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          
          if (accounts.length > 0) {
            // Auto-connect if already authorized
            await connectWallet();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setUserData(defaultData.user);
        } else {
          // User switched accounts
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload user data when chain changes
        connectWallet();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/" className="flex f">
                <img src="logo.svg" className="!size-5" alt="Logo" />
                <div className="text-base font-semibold">PolkaFlow</div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Wallet Connection Button */}
        {userData.name === "Connect Wallet" && (
          <div className="px-2 py-2">
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              <IconWallet size={16} />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={defaultData.navMain} />
        <NavDocuments items={defaultData.secondary} />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}