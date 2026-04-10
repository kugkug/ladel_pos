import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Search, Calendar as CalendarIcon, FilterX, ChevronDown } from 'lucide-react';
import { getCompanyName } from '@/lib/projectFilterUtils';

const ProjectFilterBar = ({ filters, setFilters, projects, isLoading }) => {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({ start: '', end: '' });

  const uniqueCompanies = useMemo(() => {
    if (!projects) return [];
    const companies = new Set(projects.map(p => getCompanyName(p)));
    return Array.from(companies).filter(c => c !== 'Unknown').sort();
  }, [projects]);

  const handleSearchChange = (e) => setFilters({ ...filters, search: e.target.value });
  
  const handleCompanyChange = (e) => setFilters({ ...filters, company: e.target.value });

  const handlePresetSelect = (preset) => {
    setFilters({ 
      ...filters, 
      datePreset: preset, 
      customDateActive: false,
      dateRange: { start: null, end: null }
    });
    setDatePopoverOpen(false);
  };

  const handleCustomDateApply = () => {
    setFilters({
      ...filters,
      datePreset: null,
      customDateActive: true,
      dateRange: { 
        start: tempDateRange.start || null, 
        end: tempDateRange.end || null 
      }
    });
    setDatePopoverOpen(false);
  };

  const removeFilter = (filterType) => {
    if (filterType === 'search') setFilters({ ...filters, search: '' });
    if (filterType === 'company') setFilters({ ...filters, company: 'All' });
    if (filterType === 'date') setFilters({ ...filters, datePreset: null, customDateActive: false, dateRange: { start: null, end: null } });
  };

  const resetAllFilters = () => {
    setFilters({ search: '', company: 'All', datePreset: null, dateRange: { start: null, end: null }, customDateActive: false });
    setTempDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = filters.search || filters.company !== 'All' || filters.datePreset || filters.customDateActive;

  let dateFilterLabel = 'Date Created';
  if (filters.datePreset) dateFilterLabel = filters.datePreset;
  else if (filters.customDateActive) {
    if (filters.dateRange.start && filters.dateRange.end) dateFilterLabel = `${filters.dateRange.start} to ${filters.dateRange.end}`;
    else if (filters.dateRange.start) dateFilterLabel = `From ${filters.dateRange.start}`;
    else if (filters.dateRange.end) dateFilterLabel = `Until ${filters.dateRange.end}`;
  }

  const datePresets = ['Today', 'This Week', 'This Month', 'This Year'];

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search PR / QT / PO / DR / INV / AR" 
            value={filters.search} 
            onChange={handleSearchChange}
            className="pl-10 pr-10 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 h-10"
            disabled={isLoading}
          />
          {filters.search && (
            <button 
              onClick={() => removeFilter('search')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Company Dropdown */}
        <div className="relative w-full md:w-64 shrink-0">
          <select 
            value={filters.company} 
            onChange={handleCompanyChange}
            className="w-full h-10 pl-3 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-700"
            disabled={isLoading}
          >
            <option value="All">All Companies</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Date Filter Popover */}
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={`h-10 w-full md:w-56 justify-start text-left font-normal bg-gray-50 ${filters.datePreset || filters.customDateActive ? 'border-blue-500 text-blue-700 bg-blue-50' : 'text-gray-700'}`} disabled={isLoading}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="truncate">{dateFilterLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 bg-white" align="start">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  {datePresets.map(preset => (
                    <Button 
                      key={preset} 
                      variant={filters.datePreset === preset ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handlePresetSelect(preset)}
                      className={filters.datePreset === preset ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-sm text-gray-900 mb-2">Custom Range</h4>
                <div className="grid gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                    <Input 
                      type="date" 
                      value={tempDateRange.start} 
                      onChange={(e) => setTempDateRange({...tempDateRange, start: e.target.value})} 
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                    <Input 
                      type="date" 
                      value={tempDateRange.end} 
                      onChange={(e) => setTempDateRange({...tempDateRange, end: e.target.value})} 
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setTempDateRange({start: '', end: ''})}>Clear</Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCustomDateApply}>Apply</Button>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset All Filters Button (Mobile layout flex-row wrap) */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={resetAllFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 px-3 whitespace-nowrap"
          >
            <FilterX className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-500 mr-1">Active Filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              Search: "{filters.search}"
              <button onClick={() => removeFilter('search')} className="ml-1.5 hover:text-blue-900 focus:outline-none"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          
          {filters.company !== 'All' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              Company: {filters.company}
              <button onClick={() => removeFilter('company')} className="ml-1.5 hover:text-purple-900 focus:outline-none"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          
          {(filters.datePreset || filters.customDateActive) && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              Date: {dateFilterLabel}
              <button onClick={() => removeFilter('date')} className="ml-1.5 hover:text-amber-900 focus:outline-none"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectFilterBar;