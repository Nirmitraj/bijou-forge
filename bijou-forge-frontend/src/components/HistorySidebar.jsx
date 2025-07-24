import { useState } from 'react';
import { Search, Clock, Filter, X } from 'lucide-react';
import UserCounter from './UserCounter';

export default function HistorySidebar({ models, onSelect, user, darkMode,selectedModel }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'text', 'image'
    timeRange: 'all' // 'all', 'today', 'week', 'month'
  });

  const filteredModels = models.filter(model => {
    // Text search
    const matchesSearch = 
      !searchTerm || 
      model.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.editPrompt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = 
      filters.type === 'all' || 
      (filters.type === 'text' && model.prompt) ||
      (filters.type === 'image' && model.imageUrl);
    
    // Time filter
    let matchesTime = true;
    if (filters.timeRange !== 'all') {
      const modelDate = new Date(model.timestamp);
      const now = new Date();
      
      if (filters.timeRange === 'today') {
        matchesTime = modelDate.toDateString() === now.toDateString();
      } else if (filters.timeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchesTime = modelDate >= weekAgo;
      } else if (filters.timeRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        matchesTime = modelDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesType && matchesTime;
  });

  return (
    <div className={`w-64 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} flex flex-col h-full`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="text-lg font-semibold flex items-center">
          <Clock size={18} className="mr-2" />
          Design History
        </h2>
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder="Search designs..."
            className={`w-full p-2 pl-8 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-200 text-gray-700 placeholder-gray-500'} border rounded-lg text-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className={`absolute left-2.5 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`absolute right-2.5 top-2.5 p-0.5 rounded ${isFilterOpen ? (darkMode ? 'bg-gray-600' : 'bg-gray-300') : ''}`}
          >
            <Filter size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
        
        {/* Filters dropdown */}
        {isFilterOpen && (
          <div className={`mt-2 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <X size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
            
            <div className="mb-2">
              <label className="block text-xs mb-1">Design Type</label>
              <select 
                className={`w-full p-1.5 text-xs rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="all">All Types</option>
                <option value="text">Text-based</option>
                <option value="image">Image-based</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs mb-1">Time Range</label>
              <select 
                className={`w-full p-1.5 text-xs rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}
                value={filters.timeRange}
                onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredModels.length === 0 ? (
          <div className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
            {models.length === 0 ? 'No designs yet' : 'No matching designs found'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredModels.map((model) => (
              <li key={model.id} className={darkMode ? 'border-gray-700' : 'border-gray-100'}>
                <button
                  onClick={() => onSelect(model)}
                  className={`w-full text-left p-3 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-start transition-colors ${selectedModel === model ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                >
                  <div className={`w-12 h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded mr-3 overflow-hidden border ${darkMode ? 'border-gray-500' : 'border-gray-300'}`}>
                    {model.thumbnail && (
                      <img src={model.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {model.prompt || 'Image-based design'}
                    </div>
                    {model.editPrompt && (
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 truncate`}>
                        Modified: {model.editPrompt}
                      </div>
                    )}
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'} mt-1`}>
                      {new Date(model.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`p-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <UserCounter darkMode={darkMode} />
        {!user && (
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            <a href="#login" className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
              Sign in
            </a> to save your designs permanently
          </div>
        )}
      </div>
    </div>
  );
}