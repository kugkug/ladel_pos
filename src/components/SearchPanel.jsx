import React, { useState, useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Search, X, FolderSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchPanel = () => {
  const { searchProject, clearSearch, selectedProject } = useContext(ProjectContext);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchProject(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    clearSearch();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 w-full">
          <FolderSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Project Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            type="submit" 
            className="bg-black hover:bg-gray-800 text-white flex-1 md:flex-none py-6 px-6 rounded-lg"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button 
            type="button" 
            onClick={handleClear} 
            variant="outline"
            className="py-6 px-4 rounded-lg border-gray-300 text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {selectedProject && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium uppercase tracking-wider mb-1">Active Project</p>
            <h3 className="text-xl font-bold text-gray-900">Project: {selectedProject.projectNumber}</h3>
          </div>
          <div className="mt-2 md:mt-0 text-right md:text-left">
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-semibold text-gray-800">{selectedProject.companyName || selectedProject.clientName}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;