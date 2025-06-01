import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 pt-8">
            <div className=" ml-8 mb-8">
              <TabMenu />
            </div>

            <SectionCards />
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"></div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4  *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card
        onClick={() => {
          navigate("/projects/create");
        }}
        className=" p-2 hover:translate-y-[-10px] transition-transform cursor-pointer"
      >
        <div className=" w-full h-full flex justify-center items-center gap-2 border-white/20 border-1 border-dashed rounded-xl flex-col">
          <PlusSquare className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Create a new project</p>
        </div>
      </Card>
      <ProjectCard />
      <ProjectCard />
      <ProjectCard />
      <ProjectCard />
      <ProjectCard />
      <ProjectCard />
    </div>
  );
}

function ProjectCard() {
  return (
    <Card className="@container/card p-0 pb-4 gap-2 hover:translate-y-[-10px] transition-transform cursor-pointer">
      <CardHeader
        className=" p-1 overflow-hidden rounded-xl w-full  "
        style={{ aspectRatio: "3/2" }}
      >
        <img
          src="herobg.png"
          className="rounded-lg  overflow-hidden w-full h-full"
        />
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 ">
        <div className="line-clamp-1 flex gap-2 font-medium text-">
          Trending up this month <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground text-sm">
          Visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}

const TabMenu = () => {
  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex gap-4">
        <TabsTrigger value="outline">All</TabsTrigger>
        <TabsTrigger value="past-performance">Deployed</TabsTrigger>
        <TabsTrigger value="key-personnel">Recent</TabsTrigger>
        <TabsTrigger value="focus-documents">Draft</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
