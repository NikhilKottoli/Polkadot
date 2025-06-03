import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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

const data = {
  user: {
    name: "Sahil",
    email: "sahil@example.com",
    avatar: "/avatars/sahil.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Automations",
      url: "#",
      icon: IconInnerShadowTop,
    },
    {
      title: "Integrations",
      url: "#",
      icon: IconDatabase,
    },
    {
      title: "Web3 Tools",
      url: "#",
      icon: IconFileAi,
    },
    {
      title: "Team Access",
      url: "#",
      icon: IconUsers,
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
    },
    {
      title: "Triggers",
      icon: IconCamera,
      url: "#",
      items: [
        { title: "On-Chain Events", url: "#" },
        { title: "Webhooks", url: "#" },
      ],
    },
    {
      title: "Actions",
      icon: IconFileDescription,
      url: "#",
      items: [
        { title: "Smart Contract Calls", url: "#" },
        { title: "API Invocations", url: "#" },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Help & Docs",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Templates Library",
      url: "#",
      icon: IconFolder,
    },
    {
      name: "Execution Logs",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Smart Contracts",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img src="logo.svg" className="!size-5" alt="Logo" />
                <span className="text-base font-semibold">PolkaFlow</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
