import React, { useState, useEffect } from 'react';
import useBoardStore from '../../../../store/store';

const EdgeConditionEditor = ({ edge, onClose }) => {
  const { getNodes, onEdgesChange, getEdges } = useBoardStore();
  const [label, setLabel] = useState(edge?.label || '');
  const [customLabel, setCustomLabel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const nodes = getNodes();
  const edges = getEdges();
  const sourceNode = nodes.find(n => n.id === edge?.source);
  const targetNode = nodes.find(n => n.id === edge?.target);

  const isLogicNode = sourceNode?.data?.nodeType?.includes('logic');
  const isLoopNode = sourceNode?.data?.nodeType?.includes('loop');

  useEffect(() => {
    if (edge?.label && !['true', 'false', 'yes', 'no'].includes(edge.label)) {
      setCustomLabel(edge.label);
      setShowCustomInput(true);
    }
  }, [edge]);

  const handleSave = () => {
    const newLabel = showCustomInput ? customLabel : label;
    
    // Update the edge with new label
    const updatedEdge = {
      ...edge,
      label: newLabel,
    };

    // Update edges in store
    const updatedEdges = edges.map(e => 
      e.id === edge.id ? updatedEdge : e
    );

    // Apply the change
    onEdgesChange([
      {
        type: 'reset',
        item: updatedEdges
      }
    ]);

    onClose();
  };

  const predefinedLabels = () => {
    if (isLogicNode) {
      return [
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' },
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ];
    } else if (isLoopNode) {
      return [
        { value: 'continue', label: 'Continue' },
        { value: 'break', label: 'Break' },
        { value: 'next', label: 'Next' },
      ];
    } else {
      return [
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
        { value: 'complete', label: 'Complete' },
        { value: 'next', label: 'Next' },
      ];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#171717] border border-[#404040] rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-white text-lg font-semibold mb-4">
          Edit Edge Condition
        </h3>
        
        <div className="space-y-4">
          {/* Source and Target Info */}
          <div className="text-sm text-gray-400">
            <div>From: <span className="text-white">{sourceNode?.data?.label}</span></div>
            <div>To: <span className="text-white">{targetNode?.data?.label}</span></div>
          </div>

          {/* Predefined Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Condition Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedLabels().map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setLabel(option.value);
                    setShowCustomInput(false);
                  }}
                  className={`px-3 py-2 text-sm rounded border ${
                    label === option.value && !showCustomInput
                      ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                      : 'border-[#404040] bg-[#262626] text-gray-300 hover:bg-[#333333]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Label Option */}
          <div>
            <button
              onClick={() => {
                setShowCustomInput(true);
                setLabel('');
              }}
              className={`w-full px-3 py-2 text-sm rounded border ${
                showCustomInput
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                  : 'border-[#404040] bg-[#262626] text-gray-300 hover:bg-[#333333]'
              }`}
            >
              Custom Label
            </button>
            
            {showCustomInput && (
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Enter custom label"
                className="w-full mt-2 px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            )}
          </div>

          {/* Current Label Preview */}
          <div className="text-sm text-gray-400">
            Current label: <span className="text-white font-mono">
              {showCustomInput ? customLabel : label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!label && !customLabel}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EdgeConditionEditor; 