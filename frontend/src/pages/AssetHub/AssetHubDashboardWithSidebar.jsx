import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AssetHubDashboard from "./AssetHubDashboard";

export default function AssetHubDashboardWithSidebar() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
        <div className="flex flex-1 flex-col">
          <AssetHubDashboard />
        </div>
    </SidebarProvider>
  );
}
