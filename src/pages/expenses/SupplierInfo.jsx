import React, { useState, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, AlertTriangle, Download, X } from 'lucide-react';
import { ExpensesContext } from '@/contexts/ExpensesContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AddEditSupplierModal from '@/components/AddEditSupplierModal';

const SupplierInfo = () => {
  const { suppliers, expenses, addSupplier, updateSupplier, deleteSupplier, restoreSupplier, permanentlyDeleteSupplier, emptySupplierTrash } = useContext(ExpensesContext);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [pwdDialog, setPwdDialog] = useState({ isOpen: false, type: '', id: null });
  const [pwd, setPwd] = useState('');

  const targetSuppliers = suppliers.filter(s => activeTab === 'active' ? !s.isDeleted : s.isDeleted);
  const filteredSuppliers = targetSuppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.tin?.includes(searchTerm));

  const handleAddEdit = (supplierData) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData);
      toast({ title: "Updated", description: "Supplier updated successfully." });
    } else {
      addSupplier(supplierData);
      toast({ title: "Added", description: "New supplier added successfully." });
    }
  };

  const handleDelete = (id) => {
    const hasExpenses = expenses.some(e => e.supplierId === id && !e.isDeleted);
    if (hasExpenses) return toast({ title: "Cannot Delete", description: "This supplier has active associated expenses.", variant: "destructive" });
    if(window.confirm('Move this supplier to trash?')) {
      deleteSupplier(id);
      toast({ title: "Moved to Trash", description: "Supplier moved to trash." });
    }
  };

  const handleRestore = (id) => {
    if(window.confirm('Restore this supplier?')) {
      restoreSupplier(id);
      toast({ title: "Restored", description: "Supplier restored successfully." });
    }
  };

  const handlePwdSubmit = () => {
    if (pwd !== 'admin123') return toast({ title: "Error", description: "Incorrect password.", variant: "destructive" });
    if (pwdDialog.type === 'single') {
      permanentlyDeleteSupplier(pwdDialog.id);
      toast({ title: "Deleted", description: "Supplier permanently deleted." });
    } else {
      emptySupplierTrash();
      toast({ title: "Emptied", description: "Supplier trash emptied." });
    }
    setPwdDialog({ isOpen: false, type: '', id: null });
    setPwd('');
  };

  const getSupplierStats = (id) => {
    const suppExps = expenses.filter(e => e.supplierId === id && !e.isDeleted);
    const total = suppExps.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const lastDate = suppExps.length > 0 ? [...suppExps].sort((a,b) => new Date(b.date||b.dateOfReceipt) - new Date(a.date||a.dateOfReceipt))[0].date || 'N/A' : 'N/A';
    return { total, lastDate };
  };

  const handleExportCSV = () => {
    const activeExpenses = expenses.filter(e => !e.isDeleted);
    if (activeExpenses.length === 0) {
      toast({ title: "Export Failed", description: "No active expenses to export.", variant: "destructive" });
      return;
    }

    const headers = ['Date', 'Month', 'Classification Type', 'Supplier/Fund Source', 'Amount', 'Internal Code', 'Type of Receipt', 'Status'];
    const rows = activeExpenses.map(exp => {
      const entity = exp.classification === 'Regular Expense' ? (suppliers.find(s => s.id === exp.supplierId)?.name || exp.supplierName || 'Unknown') : (exp.fundBy || exp.reimbursedBy || 'Unknown');
      return [
        exp.date || exp.dateOfReceipt || exp.dateOfInjection || exp.dateOfReimbursement || '',
        exp.month || '',
        exp.classification || '',
        entity.replace(/,/g, ''), // remove commas to prevent csv breaking
        exp.amount || 0,
        exp.internalCode || '',
        exp.receiptType || '',
        exp.status || ''
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Expenses_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Success", description: "Expenses exported successfully" });
  };

  const trashCount = suppliers.filter(s => s.isDeleted).length;

  return (
    <>
      <Helmet><title>Suppliers - Expenses</title></Helmet>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-accent">Supplier Directory</h1>
            <p className="text-muted-foreground mt-1">Manage vendors, suppliers, and service providers</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportCSV} className="border-muted text-accent hover:bg-muted">
              <Download className="w-4 h-4 mr-2" /> Export Expenses CSV
            </Button>
            <Button onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-white shadow-md transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add New Supplier
            </Button>
          </div>
        </div>

        <div className="flex gap-4 border-b border-muted">
          <button onClick={() => setActiveTab('active')} className={`pb-2 px-1 font-semibold text-sm transition-all duration-300 ${activeTab === 'active' ? 'border-b-[3px] border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Active Suppliers
          </button>
          <button onClick={() => setActiveTab('trash')} className={`pb-2 px-1 font-semibold text-sm transition-all duration-300 flex items-center ${activeTab === 'trash' ? 'border-b-[3px] border-destructive text-destructive' : 'text-muted-foreground hover:text-foreground'}`}>
            Trash Bin ({trashCount})
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-muted shadow-sm flex justify-between items-center transition-all">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
            <input type="text" placeholder="Search by name or TIN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-muted rounded-lg text-foreground focus:ring-2 focus:ring-primary bg-muted/20 outline-none transition-all" />
          </div>
          {activeTab === 'trash' && trashCount > 0 && (
            <Button variant="destructive" onClick={() => setPwdDialog({ isOpen: true, type: 'empty', id: null })} className="shadow-sm">Empty Trash</Button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-muted shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent text-white">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Supplier Details</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Total Volume</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {filteredSuppliers.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium">No suppliers found in {activeTab} list.</td></tr>
                ) : (
                  filteredSuppliers.map((supp) => {
                    const stats = getSupplierStats(supp.id);
                    return (
                      <tr key={supp.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 align-top">
                          <p className="text-sm font-bold text-accent group-hover:text-primary transition-colors">{supp.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">TIN: {supp.tin || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px] truncate" title={supp.address}>{supp.address}</p>
                        </td>
                        <td className="px-6 py-4 align-top max-w-[200px]">
                          <p className="text-sm text-foreground line-clamp-2" title={supp.description}>{supp.description || <span className="text-muted-foreground italic">No description</span>}</p>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <p className="text-sm font-medium text-foreground">{supp.contactPerson || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground mt-1">{supp.email || supp.phone || 'No contact info'}</p>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <p className="text-sm font-bold text-primary">₱{stats.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Last: {stats.lastDate}</p>
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          {activeTab === 'active' ? (
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setViewSupplier(supp)} className="text-secondary hover:text-accent p-2 rounded-md hover:bg-secondary/20 transition-colors"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => { setEditingSupplier(supp); setIsModalOpen(true); }} className="text-accent hover:text-primary p-2 rounded-md hover:bg-primary/10 transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(supp.id)} className="text-muted-foreground hover:text-destructive p-2 rounded-md hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleRestore(supp.id)} className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50 transition-colors" title="Restore"><RefreshCw className="w-4 h-4" /></button>
                              <button onClick={() => setPwdDialog({ isOpen: true, type: 'single', id: supp.id })} className="text-destructive hover:text-red-700 p-2 rounded-md hover:bg-destructive/10 transition-colors" title="Permanent Delete"><AlertTriangle className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddEditSupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddEdit} supplier={editingSupplier} />

      <Dialog open={!!viewSupplier} onOpenChange={(open) => !open && setViewSupplier(null)}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl">
          {viewSupplier && (() => {
            const stats = getSupplierStats(viewSupplier.id);
            return (
            <>
              <DialogHeader className="border-b border-muted pb-4 mb-4 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-2xl font-bold text-accent">Supplier Details</DialogTitle>
                  <Button variant="ghost" size="icon" onClick={() => setViewSupplier(null)} className="text-muted-foreground hover:bg-muted"><X className="w-5 h-5"/></Button>
                </div>
              </DialogHeader>
              <div className="space-y-6 pb-6">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-muted/20 p-5 rounded-xl border border-muted/50">
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Supplier Name</p><p className="font-bold text-foreground text-lg">{viewSupplier.name}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</p><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span></div>
                  
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Contact Person</p><p className="font-semibold text-foreground">{viewSupplier.contactPerson || 'N/A'}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">TIN</p><p className="font-semibold text-foreground">{viewSupplier.tin || 'N/A'}</p></div>

                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Phone</p><p className="font-semibold text-foreground">{viewSupplier.phone || 'N/A'}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Email</p><p className="font-semibold text-foreground">{viewSupplier.email || 'N/A'}</p></div>
                  
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Address</p><p className="font-semibold text-foreground">{viewSupplier.address || 'N/A'}</p></div>

                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Payment Terms</p><p className="font-semibold text-foreground">{viewSupplier.paymentTerms === 'Custom' ? viewSupplier.customTerms : viewSupplier.paymentTerms}</p></div>
                  <div></div>

                  {viewSupplier.description && (
                    <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Description</p><p className="text-sm bg-white p-3 rounded-lg border border-muted">{viewSupplier.description}</p></div>
                  )}

                  <div className="col-span-2 border-t border-muted pt-4 mt-2">
                    <h4 className="font-semibold text-accent mb-3">Transaction Summary</h4>
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-muted">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total Expenses</p>
                        <p className="text-xl font-bold text-primary">₱{stats.total.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Last Transaction</p>
                        <p className="font-semibold text-foreground">{stats.lastDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={pwdDialog.isOpen} onOpenChange={(open) => !open && setPwdDialog({ isOpen: false, type: '', id: null })}>
        <DialogContent className="border-destructive/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Verify Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">This action cannot be undone. Enter password ("admin123") to proceed.</p>
            <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Enter password" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdDialog({ isOpen: false, type: '', id: null })} className="border-muted hover:bg-muted">Cancel</Button>
            <Button variant="destructive" onClick={handlePwdSubmit} className="shadow-sm">Confirm Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupplierInfo;