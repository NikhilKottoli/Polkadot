import useBoardStore from "../../../../store/store";

export default function VersionTimelineModal({ versions, onClose }) {
  const {
    getCurrentProject,
    updateProject
  } = useBoardStore(); 
  
  const currentProject = getCurrentProject();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Project Version Timeline</h2>
        <div className="flex flex-col items-center">
          <div className="relative flex flex-col items-center w-8">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-1 bg-gray-300 z-0" />
            {/* Dots and timestamps */}
            {versions.map((version, idx) => (
              <button
                key={idx}
                className="relative z-10 flex flex-col items-center mb-6 last:mb-0 focus:outline-none group"
                onClick={() => handleVersionClick(version, idx)}
                title={`Go back to project ${new Date(version.timestamp).toLocaleString()}`}
                type="button"
              >
                <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow group-hover:bg-blue-700 transition" />
                <span className="mt-2 text-xs text-gray-600 whitespace-nowrap group-hover:text-blue-700 transition">
                  {new Date(version.timestamp).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}