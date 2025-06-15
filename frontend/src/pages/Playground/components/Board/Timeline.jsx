import useBoardStore from "../../../../store/store";
import { Clock, GitBranch, X } from "lucide-react";

export default function VersionTimelineModal({ versions, onClose }) {
  const { getCurrentProject, updateProject } = useBoardStore();

  const currentProject = getCurrentProject();
  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  };

  const handleVersionClick = (version) => {
    console.log("A", currentProject);
    console.log("B", version.flowData.nodes);
    const time = new Date(version.timestamp).toLocaleString();

    if (window.confirm(`Go back to project ${time}?`)) {
      // Defensive: ensure nodes is an array
      if (Array.isArray(version.flowData.nodes)) {
        updateProject(currentProject.id, { nodes: version.flowData.nodes });
        console.log("Nodes updated to:", version.flowData.nodes);
      } else {
        console.error(
          "version.flowData.nodes is not an array:",
          version.flowData.nodes
        );
        alert(
          "Cannot restore: This version does not have a valid nodes array."
        );
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-lg shadow-lg w-full max-w-lg mx-auto overflow-hidden border">
        {/* Header */}
        <div className="bg-primary px-6 py-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Version Timeline</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-primary/20 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Select a version to restore
          </p>
        </div>

        {/* Timeline Content */}
        <div className="max-h-96 overflow-y-auto p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            {/* Timeline items */}
            <div className="space-y-3">
              {versions.map((version, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleVersionClick && handleVersionClick(version, idx)
                  }
                  className="relative w-full text-left group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
                >
                  <div className="flex items-start gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-accent hover:shadow-sm border border-transparent hover:border-border">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-card border-2 border-primary rounded-full shadow-sm group-hover:border-primary/80 transition-colors" />
                      {idx === 0 && (
                        <div className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-primary/20 rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            Version {idx + 1}
                          </span>
                          {idx === versions.length - 1 && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>

                      <div className="text-sm text-muted-foreground mb-1">
                        {new Date(version.timestamp).toLocaleString()}
                      </div>

                      <div className="text-xs text-muted-foreground/80 font-medium">
                        {formatTimeAgo(version.timestamp)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {versions.length} versions available
            </span>
            <span>Click any version to restore</span>
          </div>
        </div>
      </div>
    </div>
  );
}
