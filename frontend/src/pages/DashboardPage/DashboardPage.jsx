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
import {
  PlusSquare,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  Code2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useBoardStore from "../../store/FlowBoardStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
            <Card
              className="mb-8 mx-8 relative overflow-hidden rounded-[50px] p-4 cursor-pointer"
              onClick={() => {
                navigate("/solidity-generator");
              }}
            >
              <div className="w-full h-full flex justify-center items-center gap-2 border-white/20 border-1 border-dashed rounded-[35px] flex-col p-1">
                <div className="w-full h-full flex justify-center items-center gap-2 border-white/20 border-1 border-dashed rounded-[32px] flex-col ">
                  <div className="bg-gradient-to-br w-full h-full rounded-3xl overflow-hidden">
                    {/* Background decorative elements */}
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10"></div> */}

                    {/* Main content container */}
                    <div className="relative z-10 flex  items-center justify-between h-full px-8 text-center ">
                      {/* Highlight section */}
                      <div className="mb-6 -ml-2">
                        <h2 className="text-left text-3xl font-bold text-white mb-2 mt-6">
                          Generate Solidity Contracts with AI
                        </h2>
                        <p className="text-left text-white/50 text-lg max-w-md mb-6">
                          Transform natural language into production-ready smart
                          contracts instantly
                        </p>
                        {/* Additional highlight text */}
                        <p className="text-left text-white text-sm  opacity-80 bg-purple-500/10 inline mr-36 p-4 py-2 rounded-full border border-white/20 ">
                          No coding experience required • Deploy on any EVM
                          chain
                        </p>
                      </div>

                      {/* CTA section */}
                      <div className="flex flex-col gap-4 items-end">
                        <button className="group bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] hover:from-[#3a3a3a] hover:to-[#2a2a2a] text-white font-semibold px-8 py-3 rounded-full border border-[#404040] shadow-lg flex items-center space-x-2 transform transition-all duration-200 hover:shadow-xl ">
                          <span>Start Generating Now</span>
                          <svg
                            className="w-5 h-5 transform transition-transform duration-200 group-hover:translate-x-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        </button>

                        <p className="mr-4 opacity-70">Learn More about it</p>
                      </div>
                    </div>

                    {/* Subtle pattern overlay */}
                    <div className="absolute top-4 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-4 left-0 w-32 h-32 bg-gradient-to-tr from-purple-300/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                  </div>
                </div>
              </div>
            </Card>
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

      <Card
        onClick={() => {
          navigate("/solidity-generator");
        }}
        className="p-2 hover:translate-y-[-10px] transition-transform cursor-pointer bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20"
      >
        <div className="w-full h-full flex justify-center items-center gap-2 border-purple-500/30 border-1 border-dashed rounded-xl flex-col">
          <Code2 className="size-8 text-purple-400" />
          <p className="text-purple-300 text-sm font-medium">
            AI Contract Generator
          </p>
          <p className="text-purple-400/70 text-xs text-center px-2">
            Generate Solidity contracts with AI
          </p>
        </div>
      </Card>

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

// ProjectCard component with enhanced thumbnail handling
function ProjectCard({ project }) {
  const navigate = useNavigate();
  const {
    setCurrentProject,
    updateProject,
    deleteProject,
    duplicateProject,
    getCachedThumbnail,
  } = useBoardStore();

  // Get cached thumbnail with better fallback logic
  const [thumbnailSrc, setThumbnailSrc] = useState(() => {
    const cached = getCachedThumbnail(project.id);
    return cached || project.thumbnail || "screenshott.png";
  });

  const [imageError, setImageError] = useState(false);

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

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      // Try fallback thumbnail
      const fallback =
        project.thumbnail !== "screenshot.png"
          ? project.thumbnail
          : "screenshot.png";
      setThumbnailSrc(fallback);
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
          src="screenshot.png"
          className="rounded-lg overflow-hidden w-full h-full object-cover"
          alt={project.name}
          onError={handleImageError}
          loading="lazy"
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
