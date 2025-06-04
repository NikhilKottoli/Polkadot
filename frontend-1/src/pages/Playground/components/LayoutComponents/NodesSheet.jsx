// filepath: /home/sahil/Desktop/Polkadot/frontend/src/pages/Playground/components/LayoutComponents/NodesSheet.jsx
import React, { useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { CATEGORY_CONFIG } from './CategoryConfig'; // Assuming you have a separate file for category configurations

export default function EnhancedNodesSheet() {
  const {
    allNodes,
    filteredNodes,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    recentSearches,
    setRecentSearches,
    expandedNode,
    toggleNodeExpanded,
    addNodeToBoard,
  } = useBoardStore();

  useEffect(() => {
    // Logic to filter nodes based on search term and selected category/subcategory
  }, [searchTerm, selectedCategory, selectedSubcategory, allNodes]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      setRecentSearches([...recentSearches, term.trim()]);
    }
  };

  const handleNodeClick = (node) => {
    addNodeToBoard(node);
    toggleNodeExpanded(node.id);
  };

  return (
    <div className="min-w-[600px] border border-white/10 bg-[#171717]/60 backdrop-blur-md overflow-y-auto">
      <div className="flex-1 space-y-6 px-4 py-6">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <div className="text-xs text-gray-500 font-medium">Categories</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CATEGORY_CONFIG).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all ${
                  selectedCategory === category
                    ? CATEGORY_CONFIG[category].color
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {CATEGORY_CONFIG[category].icon}
                {CATEGORY_CONFIG[category].name}
              </button>
            ))}
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredNodes.map((node) => (
            <div
              key={node.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${node.categoryConfig.color}`}
              onClick={() => handleNodeClick(node)}
            >
              <h3 className="font-medium text-sm">{node.label}</h3>
              <p className="text-xs opacity-70 leading-relaxed">{node.description}</p>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredNodes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No nodes found</p>
            <p className="text-sm">Try adjusting your search terms or category filters</p>
          </div>
        )}
      </div>
    </div>
  );
}