import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, Users, Plus, List, BarChart2, RefreshCw } from 'lucide-react';
import { ExpensesContext } from '@/contexts/ExpensesContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ExpensesDashboard = () => {
  const { expenses, suppliers } = useContext(ExpensesContext);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Exclude deleted items for metrics
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  const activeSuppliers = suppliers.filter(s => !s.isDeleted);

  const currentMonthName = MONTHS[new Date().getMonth()];
  
  const totalExpenses = activeExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const thisMonthExpenses = activeExpenses.filter(e => e.month === currentMonthName || new Date(e.date || e.dateOfReceipt || e.dateOfInjection).getMonth() === new Date().getMonth())
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Group by category for chart (excluding Funding and Reimbursement)
  const categoryData = activeExpenses.filter(e => e.classification === 'Regular Expense').reduce((acc, curr) => {
    const type = curr.typeOfExpense || curr.type || 'Other';
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.amount += Number(curr.amount);
    } else {
      acc.push({ name: type, amount: Number(curr.amount) });
    }
    return acc;
  }, []).sort((a,b) => b.amount - a.amount).slice(0, 7); // Top 7 categories

  // Monthly breakdown (ONLY Regular Expenses for YTD Chart)
  const monthlyData = MONTHS.map(month => {
    const amount = activeExpenses.filter(e => e.month === month && e.classification === 'Regular Expense').reduce((sum, exp) => sum + Number(exp.amount), 0);
    return { month: month.substring(0, 3), amount };
  });

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    // Short delay for visual feedback before reloading, matching the standard reload pattern
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <>
      <Helmet><title>Expenses Dashboard</title></Helmet>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-accent tracking-tight">Expenses Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your company's financial outflows</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              className="shadow-sm transition-all bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin text-primary' : 'text-gray-500'}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => navigate('/expenses/data-entry')} className="bg-primary hover:bg-primary/90 text-white shadow-md transition-all font-medium">
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-primary/20 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 bg-primary text-white rounded-2xl shadow-sm">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">This Month ({currentMonthName})</p>
                <h3 className="text-3xl font-bold text-primary">₱{thisMonthExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-accent/20 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent/10 rounded-full blur-xl group-hover:bg-accent/20 transition-colors"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 bg-accent text-white rounded-2xl shadow-sm">
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total YTD (All Classes)</p>
                <h3 className="text-3xl font-bold text-accent">₱{totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-secondary/50 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/20 rounded-full blur-xl group-hover:bg-secondary/30 transition-colors"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 bg-secondary text-accent rounded-2xl shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Active Suppliers</p>
                <h3 className="text-3xl font-bold text-foreground">{activeSuppliers.length}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Breakdown Chart */}
          <div className="bg-white p-6 rounded-2xl border border-muted shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-accent flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent rounded-full inline-block"></span>
                YTD Regular Expenses
              </h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `₱${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} />
                  <Tooltip cursor={{stroke: '#1B4D5C', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(val) => [`₱${Number(val).toLocaleString()}`, 'Amount']} />
                  <Line type="monotone" dataKey="amount" stroke="#1B4D5C" strokeWidth={3} dot={{r: 4, fill: '#1B4D5C', strokeWidth: 2, stroke: '#FFFFFF'}} activeDot={{r: 6, fill: '#FF6B35', strokeWidth: 0}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categories Chart */}
          <div className="bg-white p-6 rounded-2xl border border-muted shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-accent flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                Top Regular Expenses by Category
              </h2>
              <Link to="/expenses/analytics" className="text-sm text-secondary-foreground font-bold hover:text-primary transition-colors flex items-center bg-secondary/20 px-3 py-1.5 rounded-lg">
                Analytics <BarChart2 className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `₱${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1B4D5C', fontSize: 12, fontWeight: 600}} width={120} />
                  <Tooltip cursor={{fill: '#F5F5F5'}} contentStyle={{borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(val) => [`₱${Number(val).toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#FF6B35" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent List */}
        <div className="bg-white p-6 rounded-2xl border border-muted shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center mb-6 border-b border-muted pb-4">
            <h2 className="text-lg font-bold text-accent flex items-center gap-2">
              <span className="w-1.5 h-6 bg-secondary rounded-full inline-block"></span>
              Recent Transactions
            </h2>
            <Link to="/expenses/expenses-list" className="text-sm text-secondary-foreground font-bold hover:text-primary transition-colors flex items-center bg-secondary/20 px-3 py-1.5 rounded-lg">
              View All <List className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeExpenses.slice(-6).reverse().map((exp) => {
              const supplier = suppliers.find(s => s.id === exp.supplierId);
              const entityName = exp.classification === 'Regular Expense' ? (supplier?.name || exp.supplierName || 'Unknown') : (exp.fundBy || exp.reimbursedBy || 'Unknown');
              return (
                <div key={exp.id} className="flex justify-between items-center p-4 hover:bg-muted/30 rounded-xl border border-transparent hover:border-muted transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${exp.classification === 'Regular Expense' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                      {entityName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{entityName}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">{exp.date || exp.dateOfReceipt} • {exp.typeOfExpense || exp.classification}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">₱{Number(exp.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground mt-1 inline-block uppercase tracking-wider">{exp.classification}</span>
                  </div>
                </div>
              );
            })}
            {activeExpenses.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No recent expenses.</p>
                <Button variant="link" onClick={() => navigate('/expenses/data-entry')} className="text-primary mt-2">Create your first expense</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpensesDashboard;