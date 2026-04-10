import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { ExpensesContext } from '@/contexts/ExpensesContext';
import { useToast } from '@/components/ui/use-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Calendar as CalIcon } from 'lucide-react';

const ExpensesAnalytics = () => {
  const { expenses } = useContext(ExpensesContext);
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({ title: "Export", description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" });
  };

  // Prepare Data
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

  const byCategory = expenses.reduce((acc, curr) => {
    const idx = acc.findIndex(item => item.name === curr.type);
    if (idx >= 0) acc[idx].value += Number(curr.amount);
    else acc.push({ name: curr.type, value: Number(curr.amount) });
    return acc;
  }, []);

  const bySource = expenses.reduce((acc, curr) => {
    const idx = acc.findIndex(item => item.name === curr.paymentSource);
    if (idx >= 0) acc[idx].value += Number(curr.amount);
    else acc.push({ name: curr.paymentSource, value: Number(curr.amount) });
    return acc;
  }, []);

  return (
    <>
      <Helmet><title>Analytics - Expenses</title></Helmet>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
        {/* Content Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses Analytics</h1>
            <p className="text-gray-500">In-depth breakdown of your financial data</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm">
              <CalIcon className="w-4 h-4 mr-2" /> This Year
            </button>
            <button onClick={handleNotImplemented} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium text-sm">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-96">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Expenses by Category</h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {byCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-96">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Sources</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySource} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" tickFormatter={(val) => `₱${val}`} tick={{fontSize: 12, fill: '#6B7280'}} />
                <YAxis dataKey="name" type="category" tick={{fontSize: 12, fill: '#374151', fontWeight: 500}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(value) => `₱${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                  {bySource.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+2) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpensesAnalytics;