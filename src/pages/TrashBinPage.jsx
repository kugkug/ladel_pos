import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, RefreshCcw, Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import RestoreDialog from '@/components/RestoreDialog';
import DeletePermanentlyDialog from '@/components/DeletePermanentlyDialog';
import ConfirmPasswordModal from '@/components/ConfirmPasswordModal';
import { ProjectContext } from '@/contexts/ProjectContext';
import { fetchUserProfiles, mapUserIdToName } from '@/lib/userProfileUtils';
import { useAuth } from '@/contexts/AuthContext';
import { logActivity } from '@/lib/ActivityLogger';

const extractNumericValue = (str) => {
  if (!str) return 0;
  const match = String(str).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const Tabs = ({ activeTab, onChange }) => {
  const tabs = ['All', 'Projects', 'Quotations', 'Purchase Orders', 'Delivery Receipts', 'Invoices', 'Payments', 'Acknowledgement Receipts'];
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white text-red-700 shadow-sm border border-red-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const TrashBinPage = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [userProfiles, setUserProfiles] = useState(new Map());
  
  // Dialog States
  const [actionConfig, setActionConfig] = useState(null); // { action: 'restore' | 'delete', item: obj | null, multiple: boolean }
  const [isProcessing, setIsProcessing] = useState(false);
  const [projectPasswordModalOpen, setProjectPasswordModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { restoreProject, permanentlyDeleteProject } = useContext(ProjectContext);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const profiles = await fetchUserProfiles();
      setUserProfiles(profiles);

      const [
        { data: projs, error: projsError },
        { data: qts, error: qtsError }, 
        { data: pos, error: posError }, 
        { data: drs, error: drsError }, 
        { data: invs, error: invsError }, 
        { data: pays, error: paysError },
        { data: ars, error: arsError }
      ] = await Promise.all([
        supabase.from('projects').select('id, project_number, project_title, deleted_at, is_deleted, deleted_by, company:companies(company_name)').eq('is_deleted', true),
        supabase.from('quotations').select('id, quotation_number, date_issued, gross_amount, deleted_at, is_deleted, deleted_by, projects(id, project_number, project_title, company_id, companies(company_name))').eq('is_deleted', true),
        supabase.from('purchase_orders').select('id, po_number, date_issued, amount, deleted_at, is_deleted, deleted_by, projects(id, project_number, project_title, company_id, companies(company_name))').eq('is_deleted', true),
        supabase.from('delivery_receipts').select('id, dr_number, date_delivered, deleted_at, is_deleted, deleted_by, projects(id, project_number, project_title, company_id, companies(company_name))').eq('is_deleted', true),
        supabase.from('invoices').select('id, invoice_number, invoice_date, total_amount, deleted_at, is_deleted, deleted_by, projects(id, project_number, project_title, company_id, companies(company_name))').eq('is_deleted', true),
        supabase.from('payments').select('id, reference_no, payment_date, amount_paid, deleted_at, is_deleted, deleted_by, projects(id, project_number, project_title, company_id, companies(company_name))').eq('is_deleted', true),
        supabase.from('acknowledgement_receipts').select('id, ar_number, date_issued, deleted_at, is_deleted, deleted_by, projects(id, project_number, project_title, company_id, companies(company_name))').eq('is_deleted', true)
      ]);

      if (projsError) console.error("Projects fetch error:", projsError);
      if (qtsError) console.error("Quotations fetch error:", qtsError);
      if (posError) console.error("POs fetch error:", posError);
      if (drsError) console.error("DRs fetch error:", drsError);
      if (invsError) console.error("Invoices fetch error:", invsError);
      if (paysError) console.error("Payments fetch error:", paysError);
      if (arsError) console.error("ARs fetch error:", arsError);

      const formatData = (dataArray, type, table, numField, dateField, amtField) => (dataArray || []).map(item => {
        const numberStr = item[numField] || 'N/A';
        return {
          id: item.id,
          type,
          table,
          number: numberStr,
          asNumber: extractNumericValue(numberStr),
          date: item[dateField] || 'N/A',
          amount: (amtField && item[amtField]) ? item[amtField] : 0,
          deletedAt: item.deleted_at ? new Date(item.deleted_at).toLocaleString() : 'Unknown',
          projectNumber: Array.isArray(item.projects) ? item.projects[0]?.project_number : item.projects?.project_number || 'Unlinked',
          companyName: Array.isArray(item.projects) ? item.projects[0]?.companies?.company_name : item.projects?.companies?.company_name || 'Unlinked',
          deletedBy: mapUserIdToName(item.deleted_by, profiles)
        };
      });

      const formattedProjects = (projs || []).map(p => ({
        id: p.id,
        type: 'Project',
        table: 'projects',
        number: p.project_number || 'N/A',
        asNumber: extractNumericValue(p.project_number),
        date: 'N/A',
        amount: 0,
        deletedAt: p.deleted_at ? new Date(p.deleted_at).toLocaleString() : 'Unknown',
        projectNumber: p.project_title || p.project_number || 'Unnamed Project',
        companyName: p.company?.company_name || 'Unlinked',
        deletedBy: mapUserIdToName(p.deleted_by, profiles)
      }));

      const combined = [
        ...formattedProjects,
        ...formatData(qts, 'Quotation', 'quotations', 'quotation_number', 'date_issued', 'gross_amount'),
        ...formatData(pos, 'Purchase Order', 'purchase_orders', 'po_number', 'date_issued', 'amount'),
        ...formatData(drs, 'Delivery Receipt', 'delivery_receipts', 'dr_number', 'date_delivered', 'amount'),
        ...formatData(invs, 'Invoice', 'invoices', 'invoice_number', 'invoice_date', 'total_amount'),
        ...formatData(pays, 'Payment', 'payments', 'reference_no', 'payment_date', 'amount_paid'),
        ...formatData(ars, 'Acknowledgement Receipt', 'acknowledgement_receipts', 'ar_number', 'date_issued', null)
      ].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

      setItems(combined);
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load trash bin.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabToTypeMap = {
    'Projects': 'Project',
    'Quotations': 'Quotation',
    'Purchase Orders': 'Purchase Order',
    'Delivery Receipts': 'Delivery Receipt',
    'Invoices': 'Invoice',
    'Payments': 'Payment',
    'Acknowledgement Receipts': 'Acknowledgement Receipt'
  };

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'All' || item.type === tabToTypeMap[activeTab];
    const matchesSearch = item.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleAction = async (action, itemsToProcess, password = null) => {
    setIsProcessing(true);
    let errorToThrow = null;
    
    try {
      for (const item of itemsToProcess) {
        if (item.type === 'Project') {
          if (action === 'restore') {
            await restoreProject(item.id);
          } else if (action === 'delete') {
            await permanentlyDeleteProject(item.id, password);
          }
        } else {
          // Standard doc logic
          if (action === 'restore') {
            const { error } = await supabase.from(item.table).update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq('id', item.id);
            if (error) throw error;
            
            if (currentUser) {
              await logActivity({
                userId: currentUser.id,
                userEmail: currentUser.email,
                userName: currentUser.full_name || currentUser.email,
                action: 'RESTORE',
                module: 'SALES',
                entityType: item.type.toUpperCase().replace(' ', '_'),
                entityName: item.number,
                description: `Restored ${item.type}: ${item.number}`
              });
            }
          } else if (action === 'delete') {
            const { error } = await supabase.from(item.table).delete().eq('id', item.id);
            if (error) throw error;
            
            if (currentUser) {
              await logActivity({
                userId: currentUser.id,
                userEmail: currentUser.email,
                userName: currentUser.full_name || currentUser.email,
                action: 'PERMANENT_DELETE',
                module: 'SALES',
                entityType: item.type.toUpperCase().replace(' ', '_'),
                entityName: item.number,
                description: `Permanently deleted ${item.type}: ${item.number}`
              });
            }
          }
        }
      }
      
      const actionTextMap = {
        'restore': 'restored',
        'delete': 'permanently deleted'
      };
      
      const description = itemsToProcess.length === 1 && itemsToProcess[0].type === 'Acknowledgement Receipt'
        ? `AR '${itemsToProcess[0].number}' ${actionTextMap[action]}`
        : `Successfully ${actionTextMap[action]} ${itemsToProcess.length} item(s).`;
        
      toast({ title: 'Success', description });
      setActionConfig(null);
      loadData();
    } catch (error) {
      if (error.message && (error.message.includes('Invalid password') || error.message.includes('Incorrect password'))) {
        errorToThrow = error;
      } else {
        toast({ title: 'Error', description: error.message || 'An error occurred while processing.', variant: 'destructive' });
      }
    } finally {
      if (!errorToThrow) {
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        throw errorToThrow;
      }
    }
  };

  const processActionConfig = async (password = null) => {
    if (!actionConfig) return;
    const { action, item, multiple } = actionConfig;
    let itemsToProcess = [];
    
    if (multiple) {
      itemsToProcess = items.filter(i => selectedIds.has(i.id));
    } else if (item) {
      itemsToProcess = [item];
    } else {
      itemsToProcess = filteredItems;
    }

    const containsProject = itemsToProcess.some(i => i.type === 'Project');
    
    if (action === 'delete' && containsProject && !password) {
      setProjectPasswordModalOpen(true);
      return;
    }
    
    try {
      await handleAction(action, itemsToProcess, password);
    } catch (error) {
      if (error.message && (error.message.includes('password'))) {
        throw error;
      }
    }
  };

  return (
    <>
      <Helmet><title>Sales Trash Bin - Pipeline</title></Helmet>
      <div className="max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-300">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-700 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" /> Sales Trash Bin
            </h1>
            <p className="text-red-500 mt-1">Review and restore deleted sales documents and projects.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Tabs activeTab={activeTab} onChange={setActiveTab} />
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-red-400" />
              <Input 
                placeholder="Search number, project, company..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-red-50 border-red-200 focus-visible:ring-red-500"
              />
            </div>
            
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 ml-auto animate-in fade-in zoom-in duration-200">
                <span className="text-sm font-semibold text-red-700 bg-red-100 px-3 py-1.5 rounded-md border border-red-200">
                  {selectedIds.size} item(s) selected
                </span>
                <Button size="sm" variant="outline" className="bg-white hover:bg-green-50 text-green-600 border-green-200 hover:border-green-300" onClick={() => setActionConfig({ action: 'restore', item: null, multiple: true })}>
                  <RefreshCcw className="w-4 h-4 mr-2" /> Restore Selected
                </Button>
                <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700 font-semibold shadow-sm" onClick={() => setActionConfig({ action: 'delete', item: null, multiple: true })}>
                  <Trash2 className="w-4 h-4 mr-2" /> Empty Trash
                </Button>
              </div>
            )}
          </div>

          <div className="border border-red-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-red-50 border-b border-red-200 text-red-900 font-semibold">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer" 
                      checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length} 
                      onChange={handleSelectAll} 
                    />
                  </th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Deleted Info</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600"/></td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-gray-500">No deleted items found in this category.</td></tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className={`hover:bg-red-50/50 transition-colors ${selectedIds.has(item.id) ? 'bg-red-50/80' : ''}`}>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer" 
                          checked={selectedIds.has(item.id)} 
                          onChange={() => handleSelectOne(item.id)} 
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {item.type === 'Project' ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">{item.type}</span> : item.type}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{item.number}</p>
                        <p className="text-xs text-gray-500">
                          {item.projectNumber} • {item.companyName}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{item.amount > 0 ? formatCurrency(item.amount) : '—'}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600">{item.deletedAt}</p>
                        {item.deletedBy && <p className="text-[10px] text-gray-400 mt-0.5">By: {item.deletedBy}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setActionConfig({ action: 'restore', item, multiple: false })} 
                            className="text-green-600 hover:text-green-800 p-1.5 rounded-md hover:bg-green-100 transition-colors flex items-center gap-1 text-xs border border-transparent hover:border-green-200 font-medium"
                          >
                            <RefreshCcw className="w-3.5 h-3.5" /> Restore
                          </button>
                          <button 
                            onClick={() => setActionConfig({ action: 'delete', item, multiple: false })} 
                            className="text-red-600 hover:text-white p-1.5 rounded-md hover:bg-red-600 transition-colors flex items-center gap-1 text-xs border border-transparent hover:border-red-600 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!projectPasswordModalOpen && (
        <>
          <RestoreDialog 
            isOpen={actionConfig?.action === 'restore'}
            onClose={() => setActionConfig(null)}
            onConfirm={() => processActionConfig()}
            isRestoring={isProcessing}
            documentType={actionConfig?.multiple ? `${selectedIds.size} selected items` : actionConfig?.item?.type}
            documentDetails={actionConfig?.item ? { number: actionConfig.item.number, date: actionConfig.item.date, amount: actionConfig.item.amount } : null}
          />

          <DeletePermanentlyDialog 
            isOpen={actionConfig?.action === 'delete' && !items.filter(i => selectedIds.has(i.id) || (actionConfig.item && actionConfig.item.id === i.id)).some(i => i.type === 'Project')}
            onClose={() => setActionConfig(null)}
            onConfirm={() => processActionConfig()}
            isDeleting={isProcessing}
            documentType={actionConfig?.multiple ? `${selectedIds.size} selected items` : actionConfig?.item ? actionConfig.item.type : `all ${filteredItems.length} items in trash`}
            documentDetails={actionConfig?.item ? { number: actionConfig.item.number, date: actionConfig.item.date, amount: actionConfig.item.amount } : null}
          />
        </>
      )}

      {projectPasswordModalOpen && (
        <ConfirmPasswordModal
          isOpen={projectPasswordModalOpen}
          title="Confirm Permanent Deletion"
          message="This will permanently delete the selected project(s) and ALL associated documents from the database. This action CANNOT be undone. Enter your password to confirm."
          onConfirm={async (pwd) => {
            await processActionConfig(pwd);
            setProjectPasswordModalOpen(false);
          }}
          onCancel={() => {
            setProjectPasswordModalOpen(false);
            setActionConfig(null);
          }}
        />
      )}
    </>
  );
};

export default TrashBinPage;