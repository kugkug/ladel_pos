import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, Database, Building2, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const DataVisibilityForm = ({ companyAccess, setCompanyAccess, projectAccess, setProjectAccess, customerAccess, setCustomerAccess }) => {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, projRes, custRes] = await Promise.all([
          supabase.from('companies').select('id, company_name').limit(50),
          supabase.from('projects').select('id, project_number, project_title').limit(50),
          supabase.from('customers').select('id, company_name, contact_name').limit(50)
        ]);
        
        if (compRes.data) setCompanies(compRes.data);
        if (projRes.data) setProjects(projRes.data);
        if (custRes.data) setCustomers(custRes.data);
      } catch (error) {
        console.error("Error fetching visibility data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleAll = (type, data, currentSelection, setSelection) => {
    if (currentSelection.length === data.length) {
      setSelection([]);
    } else {
      setSelection(data.map(item => item.id));
    }
  };

  const handleToggleSingle = (id, currentSelection, setSelection) => {
    if (currentSelection.includes(id)) {
      setSelection(currentSelection.filter(itemId => itemId !== id));
    } else {
      setSelection([...currentSelection, id]);
    }
  };

  const renderSection = (title, icon, data, selectedIds, setSelection) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
          {icon} {title}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleToggleAll(title, data, selectedIds, setSelection)}
          className="h-8 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          {selectedIds.length === data.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      <div className="p-4 max-h-60 overflow-y-auto space-y-3 bg-white">
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Loading {title.toLowerCase()}...</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-500">No {title.toLowerCase()} found.</p>
        ) : (
          data.map(item => (
            <div key={item.id} className="flex items-center space-x-3">
              <Checkbox 
                id={`item-${item.id}`} 
                checked={selectedIds.includes(item.id)}
                onCheckedChange={() => handleToggleSingle(item.id, selectedIds, setSelection)}
              />
              <label htmlFor={`item-${item.id}`} className="text-sm font-medium leading-none text-gray-700 cursor-pointer">
                {item.company_name || item.project_number || item.contact_name} {item.project_title ? `- ${item.project_title}` : ''}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-600" />
          Data Visibility
        </CardTitle>
        <CardDescription>Restrict which specific records this staff member can see.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderSection('Companies', <Building2 className="w-4 h-4" />, companies, companyAccess, setCompanyAccess)}
          {renderSection('Projects', <Database className="w-4 h-4" />, projects, projectAccess, setProjectAccess)}
          {renderSection('Customers', <Users className="w-4 h-4" />, customers, customerAccess, setCustomerAccess)}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataVisibilityForm;