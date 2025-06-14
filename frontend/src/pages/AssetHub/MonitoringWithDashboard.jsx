import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Monitoring from "./Monitoring";

export default function MonitoringWithDashboard() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
        <div className="flex flex-1 flex-col">
          <Monitoring />
        </div>
    </SidebarProvider>
  );
}
