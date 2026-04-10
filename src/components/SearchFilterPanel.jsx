import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilterDropdown from '@/components/FilterDropdown';
import ActiveFiltersDisplay from '@/components/ActiveFiltersDisplay';

const SearchFilterPanel = ({ onFilterChange, customers = [], projects = [] }) => {
  const [localFilters, setLocalFilters] = useState({
    search: '',
    documentNumber: '',
    docType: 'All Documents',
    companies: [],
    month: 'All Months',
    year: 'All Years'
  });

  const [activeFiltersList, setActiveFiltersList] = useState([]);

  // Derive options
  const monthsOptions = [
    { label: 'All Months', value: 'All Months' },
    ...['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => ({ label: m, value: m }))
  ];

  const yearOptions = useMemo(() => {
    const years = new Set(projects.map(p => new Date(p.createdAt || Date.now()).getFullYear().toString()));
    return [
      { label: 'All Years', value: 'All Years' },
      ...Array.from(years).sort().reverse().map(y => ({ label: y, value: y }))
    ];
  }, [projects]);

  const companyOptions = useMemo(() => {
    return customers.map(c => ({ label: c.companyName, value: c.id }));
  }, [customers]);

  const docTypeOptions = [
    { label: 'All Documents', value: 'All Documents' },
    { label: 'Quotation', value: 'QT' },
    { label: 'PO', value: 'PO' },
    { label: 'DR', value: 'DR' },
    { label: 'Invoice', value: 'INV' },
    { label: 'AR', value: 'AR' }
  ];

  const buildActiveFiltersList = (filtersObj) => {
    const list = [];
    if (filtersObj.docType !== 'All Documents') {
      list.push({ type: 'docType', value: filtersObj.docType, label: `Type: ${filtersObj.docType}` });
    }
    if (filtersObj.documentNumber) {
      list.push({ type: 'documentNumber', value: filtersObj.documentNumber, label: `Doc #: ${filtersObj.documentNumber}` });
    }
    if (filtersObj.month !== 'All Months') {
      list.push({ type: 'month', value: filtersObj.month, label: `Month: ${filtersObj.month}` });
    }
    if (filtersObj.year !== 'All Years') {
      list.push({ type: 'year', value: filtersObj.year, label: `Year: ${filtersObj.year}` });
    }
    if (filtersObj.companies.length > 0) {
      filtersObj.companies.forEach(companyId => {
        const comp = customers.find(c => c.id === companyId);
        if (comp) {
          list.push({ type: 'companies', value: companyId, label: `Company: ${comp.companyName}` });
        }
      });
    }
    return list;
  };

  const handleApply = () => {
    setActiveFiltersList(buildActiveFiltersList(localFilters));
    onFilterChange(localFilters);
  };

  const handleClearAll = () => {
    const cleared = {
      search: '',
      documentNumber: '',
      docType: 'All Documents',
      companies: [],
      month: 'All Months',
      year: 'All Years'
    };
    setLocalFilters(cleared);
    setActiveFiltersList([]);
    onFilterChange(cleared);
  };

  const handleRemoveFilter = (filterToRemove) => {
    const newFilters = { ...localFilters };
    if (filterToRemove.type === 'companies') {
      newFilters.companies = newFilters.companies.filter(id => id !== filterToRemove.value);
    } else {
      newFilters[filterToRemove.type] = filterToRemove.type === 'docType' || filterToRemove.type === 'month' || filterToRemove.type === 'year' 
        ? (filterToRemove.type === 'docType' ? 'All Documents' : filterToRemove.type === 'month' ? 'All Months' : 'All Years') 
        : '';
    }
    setLocalFilters(newFilters);
    setActiveFiltersList(buildActiveFiltersList(newFilters));
    onFilterChange(newFilters);
  };

  // Real-time search update
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);
    return () => clearTimeout(timer);
  }, [localFilters.search, localFilters.documentNumber]);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-muted flex flex-col space-y-4 transition-all">
      <div className="flex items-center justify-between border-b pb-3 border-muted">
        <div className="flex items-center gap-2">
          <div className="bg-secondary/20 p-1.5 rounded-lg">
            <Filter className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-bold text-accent text-lg">Search & Filter</h3>
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersList.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
              {activeFiltersList.length} Active Filters
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-1 lg:col-span-2 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Project Number or Company..."
            value={localFilters.search}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 border border-muted rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all bg-muted/20 focus:bg-white outline-none"
          />
        </div>

        <div className="col-span-1 relative">
          <input 
            type="text" 
            placeholder="Document Number..."
            value={localFilters.documentNumber}
            onChange={(e) => setLocalFilters({ ...localFilters, documentNumber: e.target.value })}
            className="w-full px-4 py-2.5 border border-muted rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all bg-muted/20 focus:bg-white outline-none"
          />
        </div>
        
        <FilterDropdown 
          label="Document Type"
          options={docTypeOptions}
          value={localFilters.docType}
          onChange={(val) => setLocalFilters({ ...localFilters, docType: val })}
        />
        
        <FilterDropdown 
          label="Company"
          options={companyOptions}
          value={localFilters.companies}
          onChange={(val) => setLocalFilters({ ...localFilters, companies: val })}
          multiSelect={true}
          placeholder="All Companies"
        />

        <div className="col-span-1 lg:col-span-2 flex gap-4">
          <div className="w-1/2">
            <FilterDropdown 
              label="Month"
              options={monthsOptions}
              value={localFilters.month}
              onChange={(val) => setLocalFilters({ ...localFilters, month: val })}
            />
          </div>
          <div className="w-1/2">
            <FilterDropdown 
              label="Year"
              options={yearOptions}
              value={localFilters.year}
              onChange={(val) => setLocalFilters({ ...localFilters, year: val })}
            />
          </div>
        </div>
        
        <div className="col-span-1 lg:col-span-3 flex justify-end gap-3 items-end">
          <Button variant="outline" onClick={handleClearAll} className="text-muted-foreground hover:text-foreground border-muted hover:bg-muted/50">
            <RefreshCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button onClick={handleApply} className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-colors">
            Apply Filters
          </Button>
        </div>
      </div>

      <ActiveFiltersDisplay 
        filters={activeFiltersList} 
        onRemove={handleRemoveFilter} 
        onClearAll={handleClearAll} 
      />
    </div>
  );
};

export default SearchFilterPanel;