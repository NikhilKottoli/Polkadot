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
import { PlusSquare, MoreVertical, Play, Copy, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useBoardStore from "../Playground/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
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
            <div className="ml-8 mb-8">
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
  const navigate = useNavigate();
  const { getFilteredProjects } = useBoardStore();
  const projects = getFilteredProjects();

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card
        onClick={() => {
          navigate("/project/create");
        }}
        className="p-2 hover:translate-y-[-10px] transition-transform cursor-pointer"
      >
        <div className="w-full h-full flex justify-center items-center gap-2 border-white/20 border-1 border-dashed rounded-xl flex-col">
          <PlusSquare className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Create a new project</p>
        </div>
      </Card>

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { setCurrentProject, updateProject, deleteProject, duplicateProject } =
    useBoardStore();

  const handleOpenProject = () => {
    setCurrentProject(project.id);
    navigate(`/project/${project.id}`);
  };

  const handleDeploy = (e) => {
    e.stopPropagation();
    updateProject(project.id, { status: "deployed" });
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    const newProjectId = duplicateProject(project.id);
    if (newProjectId) {
      navigate(`/project/${newProjectId}`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProject(project.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "deployed":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card
      className="@container/card p-0 pb-4 gap-2 hover:translate-y-[-10px] transition-transform cursor-pointer relative group"
      onClick={handleOpenProject}
    >
      <CardHeader
        className="p-1 overflow-hidden rounded-xl w-full relative"
        style={{ aspectRatio: "3/2" }}
      >
        <img
          src={project.thumbnail}
          className="rounded-lg overflow-hidden w-full h-full object-cover"
          alt={project.name}
        />

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge
            className={`${getStatusColor(project.status)} text-white text-xs`}
          >
            {project.status}
          </Badge>
        </div>

        {/* Action Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeploy}>
                <Play className="mr-2 h-4 w-4" />
                Deploy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-1.5">
        <div className="line-clamp-1 flex gap-2 font-medium text-sm">
          {project.name}
          {project.status === "deployed" && (
            <IconTrendingUp className="size-4 text-green-500" />
          )}
        </div>
        <div className="text-muted-foreground text-xs line-clamp-2">
          {project.description}
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
          <span>{project.nodes?.length || 0} nodes</span>
          <span>•</span>
          <span>{project.edges?.length || 0} connections</span>
        </div>
      </CardFooter>
    </Card>
  );
}

const TabMenu = () => {
  const { selectedTab, setSelectedTab, getProjectStats } = useBoardStore();
  const stats = getProjectStats();

  return (
    <Tabs
      value={selectedTab}
      onValueChange={setSelectedTab}
      className="w-full flex-col justify-start gap-6"
    >
      <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex gap-4">
        <TabsTrigger value="all" className="flex items-center gap-2">
          All
          <Badge variant="secondary" className="ml-1 text-xs">
            {stats.total}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="deployed" className="flex items-center gap-2">
          Deployed
          <Badge variant="secondary" className="ml-1 text-xs">
            {stats.deployed}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="recent" className="flex items-center gap-2">
          Recent
          <Badge variant="secondary" className="ml-1 text-xs">
            {stats.recent}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="draft" className="flex items-center gap-2">
          Draft
          <Badge variant="secondary" className="ml-1 text-xs">
            {stats.draft}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
