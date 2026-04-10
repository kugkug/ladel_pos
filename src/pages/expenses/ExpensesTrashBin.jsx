import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, AlertTriangle, Filter, X, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { getTrashedExpenses, restoreExpense, permanentlyDeleteExpense } from '@/lib/expenseService';

const MONTHS = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ExpensesTrashBin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All Months');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTrashedExpenses();
      setExpenses(data);
      setSelectedIds([]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load trashed expenses.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getEntityName = (exp) => {
    const { data } = exp;
    if (exp.type === 'regular-expenses') return data.supplier_name || 'Unknown Supplier';
    if (exp.type === 'capitalisation') return data.fund_by || 'Unknown';
    if (exp.type === 'reimbursement') return data.reimbursed_by || 'Unknown';
    if (exp.type === 'dividends') return data.paid_to || 'Unknown';
    return '-';
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'regular-expenses': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Regular Expense</span>;
      case 'reimbursement': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Reimbursement</span>;
      case 'capitalisation': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Capitalisation</span>;
      case 'dividends': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Dividends</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Unknown</span>;
    }
  };

  const getAmount = (exp) => Number(exp.data.amount_php || 0);
  const getDate = (exp) => exp.data.date_of_receipt || exp.data.date_of_transaction || 'N/A';
  const getDesc = (exp) => exp.data.description || exp.data.notes || '';

  const handleRestore = async (id) => {
    if (window.confirm('Restore this expense to active list?')) {
      try {
        await restoreExpense(id);
        toast({ title: "Success", description: "Expense restored successfully" });
        setExpenses(prev => prev.filter(e => e.id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      } catch (error) {
        toast({ title: "Error", description: "Failed to restore expense.", variant: "destructive" });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this record? This action cannot be undone.')) {
      try {
        await permanentlyDeleteExpense(id);
        toast({ title: "Deleted", description: "Record permanently deleted" });
        setExpenses(prev => prev.filter(e => e.id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      } catch (error) {
        toast({ title: "Error", description: "Failed to perform permanent delete.", variant: "destructive" });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Permanently delete ${selectedIds.length} record(s)? This action cannot be undone.`)) {
      try {
        for (const id of selectedIds) {
          await permanentlyDeleteExpense(id);
        }
        toast({ title: "Deleted", description: `${selectedIds.length} record(s) permanently deleted` });
        setExpenses(prev => prev.filter(e => !selectedIds.includes(e.id)));
        setSelectedIds([]);
      } catch (error) {
        toast({ title: "Error", description: "Failed to perform bulk permanent delete.", variant: "destructive" });
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('All');
    setFilterMonth('All Months');
  };

  const filteredExpenses = expenses.filter(exp => {
    const searchString = `${getEntityName(exp)} ${getDesc(exp)} ${exp.internal_code || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || exp.type === filterType;
    const matchesMonth = filterMonth === 'All Months' || exp.data.month === filterMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredExpenses.map(exp => exp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Helmet><title>Trash Bin - Expenses</title></Helmet>
      <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => navigate('/expenses/expenses-list')}
                className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Expenses
              </button>
            </div>
            <h1 className="text-3xl font-bold text-red-700 flex items-center gap-3">
              <Trash2 className="w-8 h-8" />
              Expenses Trash Bin
            </h1>
            <p className="text-red-500 mt-1">Review and restore deleted financial records ({expenses.length} total)</p>
          </div>
        </div>

        <div className="flex gap-4 border-b border-red-200">
          <button onClick={() => navigate('/expenses/expenses-list')} className="pb-2 px-1 font-semibold text-sm transition-all duration-300 text-gray-500 hover:text-gray-900 border-b-[3px] border-transparent">
            Active Expenses
          </button>
          <button className="pb-2 px-1 font-semibold text-sm transition-all duration-300 border-b-[3px] border-red-600 text-red-700">
            Trash Bin
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm transition-all">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96 flex-shrink-0">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search deleted records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-red-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 bg-red-50 outline-none transition-all" />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center bg-red-50 border border-red-200 rounded-lg p-1">
                <Filter className="w-4 h-4 text-gray-400 mx-2" />
                <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-transparent border-none py-1.5 pr-8 pl-2 text-sm font-medium text-gray-900 outline-none focus:ring-0 cursor-pointer">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-red-200 rounded-lg bg-red-50 text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all">
                <option value="All">All Types</option>
                <option value="regular-expenses">Regular Expense</option>
                <option value="reimbursement">Reimbursement</option>
                <option value="capitalisation">Capitalisation</option>
                <option value="dividends">Dividends</option>
              </select>

              {(searchTerm || filterType !== 'All' || filterMonth !== 'All Months') && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-red-600 border-red-200 hover:bg-red-50">
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-3 ml-auto animate-in fade-in zoom-in duration-200">
                  <span className="text-sm font-semibold text-red-700 bg-red-100 px-3 py-1.5 rounded-md border border-red-200">
                    {selectedIds.length} items selected
                  </span>
                  <Button 
                    variant="destructive" 
                    onClick={handleBulkDelete} 
                    className="shadow-sm bg-red-600 hover:bg-red-700 font-semibold"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Empty Trash
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-red-50 border-b border-red-200 text-red-900">
                  <th className="px-6 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      checked={filteredExpenses.length > 0 && selectedIds.length === filteredExpenses.length}
                      onChange={handleSelectAll}
                      title="Select All"
                    />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Internal Code</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Date / Month</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Classification</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Amount (₱)</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">Loading trashed expenses...</td></tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">Trash bin is empty.</td></tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className={`hover:bg-red-50/50 transition-colors group ${selectedIds.includes(exp.id) ? 'bg-red-50/80' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          checked={selectedIds.includes(exp.id)}
                          onChange={() => handleSelect(exp.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 line-through group-hover:text-red-700">{exp.internal_code || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{getDate(exp)}</div>
                        <div className="text-xs mt-0.5">{exp.data.month}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTypeBadge(exp.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getEntityName(exp)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">₱{getAmount(exp).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleRestore(exp.id)} className="text-green-600 hover:text-green-800 p-1.5 rounded-md hover:bg-green-100 transition-colors flex items-center gap-1 text-xs border border-transparent hover:border-green-200">
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                          </button>
                          <button onClick={() => handleDelete(exp.id)} className="text-red-600 hover:text-white p-1.5 rounded-md hover:bg-red-600 transition-colors flex items-center gap-1 text-xs border border-transparent hover:border-red-600">
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
    </>
  );
};

export default ExpensesTrashBin;