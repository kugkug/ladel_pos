import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FileText, Briefcase, FileSignature, Truck, Receipt, CheckSquare, Loader2, Edit, Plus, Trash2, Eye } from 'lucide-react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { CompanyContext } from '@/contexts/CompanyContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

import QuotationEditModal from '@/components/QuotationEditModal';
import QuotationPreviewModal from '@/components/QuotationPreviewModal';
import AddPOModal from '@/components/AddPOModal';
import POEditModal from '@/components/POEditModal';
import POPreviewModal from '@/components/POPreviewModal';
import AddDRModal from '@/components/AddDRModal';
import EditDRModal from '@/components/EditDRModal';
import DRPreviewModal from '@/components/DRPreviewModal';
import AddInvoiceModal from '@/components/AddInvoiceModal';
import EditInvoiceModal from '@/components/EditInvoiceModal';
import InvoicePreviewModal from '@/components/InvoicePreviewModal';
import AddPaymentModal from '@/components/AddPaymentModal';
import EditPaymentModal from '@/components/EditPaymentModal';
import PaymentPreviewModal from '@/components/PaymentPreviewModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import ConfirmPasswordModal from '@/components/ConfirmPasswordModal';
import { calculateDeliveryStatus, calculateInvoiceStatus, calculatePaymentStatus } from '@/lib/documentFlowUtils';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-700';
  if (['Completed', 'Completed Issued', 'Paid', 'Confirmed'].includes(status)) color = 'bg-green-100 text-green-700';
  if (['Partial', 'Partial Issued', 'Pending', 'Temporary PO', 'Customer PO'].includes(status)) color = 'bg-yellow-100 text-yellow-700';
  if (['Unpaid', 'Canceled', 'Not Started', 'Not Issued'].includes(status)) color = 'bg-red-100 text-red-700';
  return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>{status || 'N/A'}</span>;
};

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProjectWithAllDocuments, updateProject } = useContext(ProjectContext);
  const { companies } = useContext(CompanyContext);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [modals, setModals] = useState({
    qtEdit: false, qtPreview: false, poAdd: false, poEdit: false, poPreview: false, drAdd: false, drEdit: false, drPreview: false,
    invAdd: false, invEdit: false, invPreview: false, payAdd: false, payEdit: false, payPreview: false, delete: false
  });
  
  const [activeItem, setActiveItem] = useState(null);
  const [prefillPOData, setPrefillPOData] = useState(null);
  const [deleteConfig, setDeleteConfig] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditProjectInfoOpen, setIsEditProjectInfoOpen] = useState(false);
  const [projectInfoDraft, setProjectInfoDraft] = useState({
    pr_number: '',
    company_id: '',
    project_title: ''
  });
  const [pendingProjectUpdate, setPendingProjectUpdate] = useState(null);
  const [isManagerOverrideOpen, setIsManagerOverrideOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await getProjectWithAllDocuments(projectId);
      if (!result || !result.project) {
        toast({ title: 'Error', description: 'Project not found or could not be loaded.', variant: 'destructive' });
        navigate('/sales/projects');
        return;
      }
      setData(result);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load project details.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId]);

  const openModal = (type, item = null, prefill = null) => {
    setActiveItem(item);
    if(prefill) setPrefillPOData(prefill);
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: false }));
    if(type !== 'delete') setActiveItem(null);
    setPrefillPOData(null);
  };

  const promptDelete = (type, item, details) => {
    setDeleteConfig({ type, item, details });
    setModals(prev => ({ ...prev, delete: true }));
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig || !currentUser || !data?.project) return;
    setIsDeleting(true);
    const { type, item } = deleteConfig;
    
    try {
      const payload = { is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: currentUser.id };
      
      if (type === 'Quotation') {
        await supabase.from('quotations').update(payload).eq('id', item.id);
      } else if (type === 'Purchase Order') {
        await supabase.from('projects').update({
          po_type: null, po_number: null, po_date: null, po_amount_net: null, po_tax_type: null, 
          po_vat_amount: null, po_amount_inclusive: null, po_notes: null,
          payment_terms: null, customer_po_number: null, temporary_po_code: null, temporary_po_amount: null, po_created_at: null
        }).eq('id', data.project?.id);
        await supabase.from('purchase_orders').update(payload).eq('project_id', data.project?.id);
      } else if (type === 'Delivery Receipt') {
        await supabase.from('delivery_receipts').update(payload).eq('id', item.id);
        const { data: drs } = await supabase.from('delivery_receipts').select('dr_status').eq('project_id', data.project?.id).eq('is_deleted', false);
        await supabase.from('projects').update({ delivery_status: calculateDeliveryStatus(drs) }).eq('id', data.project?.id);
      } else if (type === 'Invoice') {
        await supabase.from('invoices').update(payload).eq('id', item.id);
        const { data: invs } = await supabase.from('invoices').select('invoice_issue_status').eq('project_id', data.project?.id).eq('is_deleted', false);
        await supabase.from('projects').update({ invoice_status: calculateInvoiceStatus(invs) }).eq('id', data.project?.id);
      } else if (type === 'Payment') {
        await supabase.from('payments').update(payload).eq('id', item.id);
        const { data: pays } = await supabase.from('payments').select('amount_paid').eq('project_id', data.project?.id).eq('is_deleted', false);
        const { data: invs } = await supabase.from('invoices').select('total_amount').eq('project_id', data.project?.id).eq('is_deleted', false);
        const totalPaid = pays.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const totalInvoiced = invs.reduce((sum, i) => sum + Number(i.total_amount), 0);
        await supabase.from('projects').update({ payment_status: calculatePaymentStatus(totalInvoiced, totalPaid) }).eq('id', data.project?.id);
      }

      toast({ title: 'Success', description: `${type} moved to trash.` });
      closeModal('delete');
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePromptPO = (qtData) => {
    if (window.confirm("Quotation confirmed! Add Purchase Order now? \n\nClick OK to Add PO. Click Cancel for Later.")) {
      openModal('poAdd', null, { amount: qtData.gross_amount, tax_type: qtData.tax_type || 'VAT (12%)' });
    }
  };

  const openEditProjectInfo = () => {
    if (!data?.project) return;
    setProjectInfoDraft({
      pr_number: data.project.project_number || data.project.pr_number || '',
      company_id: data.project.company_id || '',
      project_title: data.project.project_title || ''
    });
    setIsEditProjectInfoOpen(true);
  };

  const submitProjectInfoEdit = async (e) => {
    e.preventDefault();
    if (!projectInfoDraft.pr_number.trim()) {
      toast({ title: 'Error', description: 'Project number is required.', variant: 'destructive' });
      return;
    }
    if (!projectInfoDraft.company_id) {
      toast({ title: 'Error', description: 'Company is required.', variant: 'destructive' });
      return;
    }
    if (!projectInfoDraft.project_title.trim()) {
      toast({ title: 'Error', description: 'Project title is required.', variant: 'destructive' });
      return;
    }
    setPendingProjectUpdate({ ...projectInfoDraft });
    setIsManagerOverrideOpen(true);
  };

  const handleManagerOverrideConfirm = async (password) => {
    if (!currentUser?.email) throw new Error('No authenticated user.');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password
    });
    if (authError) throw new Error('Invalid password');

    const payload = { ...pendingProjectUpdate };

    if (
      data?.project?.company_id &&
      pendingProjectUpdate?.company_id &&
      pendingProjectUpdate.company_id !== data.project.company_id
    ) {
      const { data: primaryContact } = await supabase
        .from('company_contacts')
        .select('id')
        .eq('company_id', pendingProjectUpdate.company_id)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle();

      payload.contact_id = primaryContact?.id || null;
    }

    await updateProject(data.project.id, payload);
    toast({ title: 'Success', description: 'Project details updated successfully.' });
    setIsManagerOverrideOpen(false);
    setIsEditProjectInfoOpen(false);
    setPendingProjectUpdate(null);
    await loadData();
  };

  if (isLoading || !data || !data.project) return (
    <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600"/>
      <p className="text-gray-500 font-medium animate-pulse">Loading project details...</p>
    </div>
  );

  const { project, quotations, deliveryReceipts, invoices, payments } = data;
  const quotation = quotations?.[0] || {};
  
  // Safe optional chaining to prevent null reference errors
  const prNumber = project?.pr_number || project?.project_number;
  const projectIdentifier = prNumber ? `PR No: ${prNumber}` : `Project: ${project?.project_title || 'Loading...'}`;
  
  const totalInvoiced = (invoices || []).reduce((sum, inv) => sum + Number(inv?.total_amount || 0), 0);
  const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p?.amount_paid || 0), 0);
  const balance = totalInvoiced - totalPaid;

  return (
    <>
      <Helmet><title>{projectIdentifier} - Details</title></Helmet>
      <div className="max-w-[1200px] mx-auto pb-16 animate-in fade-in duration-300">
        
        {project ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
            <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate('/sales')}>Sales</span>
            <span>→</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate('/sales/projects')}>Projects</span>
            <span>→</span>
            <span className="text-gray-900">{projectIdentifier}</span>
          </div>
        ) : (
          <div className="h-6 mb-6 flex items-center"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
        )}

        {project ? (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{projectIdentifier}</h1>
              </div>
              <p className="text-lg font-medium text-gray-800">{project?.company?.company_name || 'Loading Company...'}</p>
              <p className="text-sm text-gray-500 mt-1">{project?.project_title || 'No Title'} | Contact: {project?.contact?.contact_name || 'N/A'}</p>
            </div>
            <div className="text-left md:text-right bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl w-full md:w-auto">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Pipeline Balance</p>
              <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(balance)}</p>
              <Button variant="outline" size="sm" onClick={openEditProjectInfo} className="mt-3 bg-white shadow-sm hover:border-blue-300 h-9">
                <Edit className="w-4 h-4 mr-2" /> Edit Project Info
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-32 bg-gray-100 animate-pulse rounded-2xl mb-8"></div>
        )}

        <div className="space-y-6">
          {/* 1. Quotation */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-gray-200">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">1. Quotation</h3>
              </div>
              {quotation?.id && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openModal('qtEdit', quotation)} className="bg-white shadow-sm hover:border-blue-300 h-9"><Edit className="w-4 h-4 mr-2"/> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => openModal('qtPreview', quotation)} className="bg-white shadow-sm h-9"><Eye className="w-4 h-4 mr-2"/> Preview</Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 h-9" onClick={() => promptDelete('Quotation', quotation, { number: quotation?.quotation_number, date: quotation?.date_issued, amount: quotation?.gross_amount })}><Trash2 className="w-4 h-4"/></Button>
                </div>
              )}
            </div>
            <div className="p-6">
              {quotation?.id ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-xl text-gray-900">{quotation?.quotation_number}</span>
                      <StatusBadge status={quotation?.quotation_status} />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Issued: {quotation?.date_issued || 'N/A'}</p>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{quotation?.order_description || 'No description attached.'}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Amount Before Tax:</span> <span>{formatCurrency(quotation?.net_amount)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Tax Type:</span> <span>{quotation?.tax_type || 'VAT (12%)'}</span></div>
                    <div className="flex justify-between text-gray-600"><span>VAT Amount:</span> <span>{formatCurrency(quotation?.vat_amount)}</span></div>
                    <div className="flex justify-between font-bold text-xl text-blue-800 pt-3 mt-1 border-t border-blue-200"><span>Total Amount:</span> <span>{formatCurrency(quotation?.gross_amount)}</span></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No quotation found.</p>
              )}
            </div>
          </div>

          {/* 2. Purchase Order */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-gray-200">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">2. Purchase Order</h3>
              </div>
              {!project?.po_type ? (
                <Button variant="outline" size="sm" onClick={() => openModal('poAdd')} className="bg-white shadow-sm hover:border-blue-300 h-9"><Plus className="w-4 h-4 mr-1"/> Add PO</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openModal('poEdit', project)} className="bg-white shadow-sm hover:border-blue-300 h-9"><Edit className="w-4 h-4 mr-2"/> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => openModal('poPreview', project)} className="bg-white shadow-sm h-9"><Eye className="w-4 h-4 mr-2"/> Preview</Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 h-9" onClick={() => promptDelete('Purchase Order', project, { number: project?.po_number || project?.customer_po_number || project?.temporary_po_code, date: project?.po_date, amount: project?.po_amount_inclusive || project?.temporary_po_amount })}><Trash2 className="w-4 h-4"/></Button>
                </div>
              )}
            </div>
            <div className="p-6">
              {project?.po_type ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-xl text-gray-900">{project?.po_number || project?.customer_po_number || project?.temporary_po_code}</span>
                      <StatusBadge status={project?.po_type} />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Date: {project?.po_date || new Date(project?.po_created_at || Date.now()).toISOString().split('T')[0]}</p>
                    <p className="text-sm font-semibold text-gray-700 bg-gray-50 p-2 rounded inline-block mb-4">Terms: {project?.payment_terms || 'N/A'}</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{project?.po_notes || 'No notes attached.'}</p>
                  </div>
                  <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Tax Type:</span> <span className="font-medium">{project?.po_tax_type || 'VAT (12%)'}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Net Amount:</span> <span>{formatCurrency(project?.po_amount_net)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>VAT Amount:</span> <span>{formatCurrency(project?.po_vat_amount)}</span></div>
                    <div className="flex justify-between font-bold text-xl text-blue-800 pt-3 mt-1 border-t border-blue-200"><span>Inclusive Amount:</span> <span>{formatCurrency(project?.po_amount_inclusive || project?.temporary_po_amount)}</span></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">No Purchase Order issued yet.</p>
              )}
            </div>
          </div>

          {/* 3. Delivery Receipts */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-gray-200">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">3. Delivery Receipts <StatusBadge status={project?.delivery_status} /></h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => openModal('drAdd')} disabled={project?.delivery_status === 'Completed'} className="bg-white shadow-sm hover:border-blue-300 h-9">
                <Plus className="w-4 h-4 mr-1"/> Add DR
              </Button>
            </div>
            <div className="p-6">
              {deliveryReceipts && deliveryReceipts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deliveryReceipts.map(dr => (
                    <div key={dr.id} className="border border-gray-200 p-4 rounded-xl shadow-sm bg-gray-50/50 hover:bg-white transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{dr?.dr_number}</p>
                          <p className="text-sm text-gray-500">{dr?.date_delivered}</p>
                        </div>
                        <StatusBadge status={dr?.dr_status} />
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-4 h-8">{dr?.notes || 'No notes'}</p>
                      <div className="flex justify-end gap-1 pt-2 border-t border-gray-100 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => openModal('drEdit', dr)} className="h-8"><Edit className="w-4 h-4 mr-1"/> Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => openModal('drPreview', dr)} className="h-8"><Eye className="w-4 h-4 mr-1"/> Preview</Button>
                        <Button variant="ghost" size="sm" onClick={() => promptDelete('Delivery Receipt', dr, { number: dr?.dr_number, date: dr?.date_delivered, amount: 0 })} className="text-red-500 h-8"><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-center py-6">No delivery receipts added.</p>}
            </div>
          </div>

          {/* 4. Invoices */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-gray-200">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">4. Invoices <StatusBadge status={project?.invoice_status} /></h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => openModal('invAdd')} className="bg-white shadow-sm hover:border-blue-300 h-9">
                <Plus className="w-4 h-4 mr-1"/> Add Invoice
              </Button>
            </div>
            <div className="p-6">
              {invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr><th className="p-4 text-gray-600">Invoice No.</th><th className="p-4 text-gray-600">Dates</th><th className="p-4 text-gray-600 text-right">Total Amount</th><th className="p-4 text-gray-600 text-center">Status</th><th className="p-4 text-gray-600 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-4 font-bold text-gray-900">{inv?.invoice_number}</td>
                          <td className="p-4 text-gray-500">Inv: {inv?.invoice_date}<br/><span className="text-red-500">Due: {inv?.due_date}</span></td>
                          <td className="p-4 font-bold text-blue-700 text-right">{formatCurrency(inv?.total_amount)}</td>
                          <td className="p-4 text-center"><StatusBadge status={inv?.invoice_issue_status} /></td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="outline" size="sm" onClick={() => openModal('invEdit', inv)} className="h-8"><Edit className="w-4 h-4 mr-1"/> Edit</Button>
                              <Button variant="outline" size="sm" onClick={() => openModal('invPreview', inv)} className="h-8"><Eye className="w-4 h-4 mr-1"/> Preview</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => promptDelete('Invoice', inv, { number: inv?.invoice_number, date: inv?.invoice_date, amount: inv?.total_amount })}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-gray-500 text-center py-6">No invoices created.</p>}
            </div>
          </div>

          {/* 5. Payments */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-gray-200">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">5. Payments & Collection <StatusBadge status={project?.payment_status} /></h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => openModal('payAdd')} className="bg-white shadow-sm hover:border-blue-300 h-9">
                <Plus className="w-4 h-4 mr-1"/> Record Payment
              </Button>
            </div>
            <div className="p-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><p className="text-sm font-medium text-gray-500">Total Invoiced</p><p className="font-bold text-2xl text-gray-900 mt-1">{formatCurrency(totalInvoiced)}</p></div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200"><p className="text-sm font-medium text-green-700">Total Collected</p><p className="font-bold text-2xl text-green-800 mt-1">{formatCurrency(totalPaid)}</p></div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200"><p className="text-sm font-medium text-red-700">Outstanding Balance</p><p className="font-bold text-2xl text-red-800 mt-1">{formatCurrency(balance)}</p></div>
              </div>

              {payments && payments.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr><th className="p-4 text-gray-600">Date</th><th className="p-4 text-gray-600">Method & Ref</th><th className="p-4 text-gray-600">Notes</th><th className="p-4 text-gray-600 text-right">Amount</th><th className="p-4 text-gray-600 text-center">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-4 font-medium text-gray-900">{pay?.payment_date}</td>
                          <td className="p-4 text-gray-600">{pay?.payment_method}<br/><span className="text-xs text-gray-400">{pay?.reference_no}</span></td>
                          <td className="p-4 text-gray-500 text-xs max-w-xs truncate">{pay?.notes || '-'}</td>
                          <td className="p-4 font-bold text-green-600 text-right">{formatCurrency(pay?.amount_paid)}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="outline" size="sm" onClick={() => openModal('payEdit', pay)} className="h-8"><Edit className="w-4 h-4 mr-1"/> Edit</Button>
                              <Button variant="outline" size="sm" onClick={() => openModal('payPreview', pay)} className="h-8"><Eye className="w-4 h-4 mr-1"/> Preview</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => promptDelete('Payment', pay, { number: pay?.reference_no || 'No Ref', date: pay?.payment_date, amount: pay?.amount_paid })}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-gray-500 text-center py-6">No payments recorded.</p>}
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <QuotationEditModal isOpen={modals.qtEdit} onClose={() => closeModal('qtEdit')} data={activeItem} onSaveSuccess={loadData} onPromptPO={handlePromptPO} />
      <QuotationPreviewModal isOpen={modals.qtPreview} onClose={() => closeModal('qtPreview')} data={activeItem} />
      
      <AddPOModal isOpen={modals.poAdd} onClose={() => closeModal('poAdd')} project={project} prefillData={prefillPOData} onSaveSuccess={loadData} />
      <POEditModal isOpen={modals.poEdit} onClose={() => closeModal('poEdit')} data={activeItem} onSaveSuccess={loadData} />
      <POPreviewModal isOpen={modals.poPreview} onClose={() => closeModal('poPreview')} data={activeItem} />
      
      <AddDRModal isOpen={modals.drAdd} onClose={() => closeModal('drAdd')} project={project} onSaveSuccess={loadData} onPromptInvoice={() => openModal('invAdd')} />
      <EditDRModal isOpen={modals.drEdit} onClose={() => closeModal('drEdit')} data={activeItem} project={project} onSaveSuccess={loadData} />
      <DRPreviewModal isOpen={modals.drPreview} onClose={() => closeModal('drPreview')} data={activeItem} />

      <AddInvoiceModal isOpen={modals.invAdd} onClose={() => closeModal('invAdd')} project={project} onSaveSuccess={loadData} />
      <EditInvoiceModal isOpen={modals.invEdit} onClose={() => closeModal('invEdit')} data={activeItem} project={project} onSaveSuccess={loadData} />
      <InvoicePreviewModal isOpen={modals.invPreview} onClose={() => closeModal('invPreview')} data={activeItem} />

      <AddPaymentModal isOpen={modals.payAdd} onClose={() => closeModal('payAdd')} project={project} invoices={invoices} onSaveSuccess={loadData} />
      <EditPaymentModal isOpen={modals.payEdit} onClose={() => closeModal('payEdit')} data={activeItem} project={project} invoices={invoices} onSaveSuccess={loadData} />
      <PaymentPreviewModal isOpen={modals.payPreview} onClose={() => closeModal('payPreview')} data={activeItem} />

      <DeleteConfirmationDialog 
        isOpen={modals.delete} 
        onClose={() => closeModal('delete')} 
        onConfirm={handleConfirmDelete}
        documentType={deleteConfig?.type}
        documentDetails={deleteConfig?.details}
        isDeleting={isDeleting}
      />

      <Dialog open={isEditProjectInfoOpen} onOpenChange={(open) => !open && setIsEditProjectInfoOpen(false)}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Edit Project Information</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitProjectInfoEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Project Number</Label>
              <Input
                value={projectInfoDraft.pr_number}
                onChange={(e) => setProjectInfoDraft((prev) => ({ ...prev, pr_number: e.target.value }))}
                placeholder="PR-0001"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <select
                value={projectInfoDraft.company_id}
                onChange={(e) => setProjectInfoDraft((prev) => ({ ...prev, company_id: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="">Select company</option>
                {(companies || []).map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Project Title</Label>
              <Input
                value={projectInfoDraft.project_title}
                onChange={(e) => setProjectInfoDraft((prev) => ({ ...prev, project_title: e.target.value }))}
                placeholder="Project title"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditProjectInfoOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Continue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmPasswordModal
        isOpen={isManagerOverrideOpen}
        title="Manager Override Required"
        message="Enter manager password to apply edits to project number, company, and project title."
        onConfirm={handleManagerOverrideConfirm}
        onCancel={() => {
          setIsManagerOverrideOpen(false);
          setPendingProjectUpdate(null);
        }}
      />
    </>
  );
};

export default ProjectDetailsPage;