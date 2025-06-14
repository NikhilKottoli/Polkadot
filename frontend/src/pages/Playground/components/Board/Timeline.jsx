import useBoardStore from "../../../../store/store";
import { Clock, GitBranch, X } from 'lucide-react';

export default function VersionTimelineModal({ versions, onClose }) {
  const {
    getCurrentProject,
    updateProject
  } = useBoardStore(); 
  
  const currentProject = getCurrentProject();
  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  const handleVersionClick = (version) => {
    console.log('A', currentProject);
    console.log('B', version.flowData.nodes);
    const time = new Date(version.timestamp).toLocaleString();

    if (window.confirm(`Go back to project ${time}?`)) {
      // Defensive: ensure nodes is an array
      if (Array.isArray(version.flowData.nodes)) {
        updateProject(currentProject.id, { nodes: version.flowData.nodes });
        console.log('Nodes updated to:', version.flowData.nodes);
      } else {
        console.error('version.flowData.nodes is not an array:', version.flowData.nodes);
        alert('Cannot restore: This version does not have a valid nodes array.');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Version Timeline</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-1">Select a version to restore</p>
        </div>

        {/* Timeline Content */}
        <div className="max-h-96 overflow-y-auto p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-gray-200" />
            
            {/* Timeline items */}
            <div className="space-y-4">
              {versions.map((version, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVersionClick && handleVersionClick(version, idx)}
                  className="relative w-full text-left group focus:outline-none"
                >
                  <div className="flex items-start gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-200">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-white border-4 border-blue-500 rounded-full shadow-sm group-hover:border-purple-500 transition-colors" />
                      {idx === 0 && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full animate-pulse opacity-30" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          Version {idx+1}
                          {(idx === versions.length-1) && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </span>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                      
                      <div className="text-xs text-gray-600 font-medium">
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
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
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