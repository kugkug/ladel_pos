import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useProjects } from '@/hooks/useProjects';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';

const ReportsPage = () => {
  const { projects } = useProjects();
  const [dateFilter, setDateFilter] = useState('all');

  // Calculate P&L metrics
  const totalRevenue = projects.reduce((sum, project) => {
    return sum + (parseFloat(project.invoiceAmount) || 0);
  }, 0);

  const totalExpenses = 0; // Placeholder for future expense tracking
  const profit = totalRevenue - totalExpenses;
  const averageProjectValue = projects.length > 0 ? totalRevenue / projects.length : 0;
  
  const completedProjects = projects.filter(project => 
    project.quotationStatus === 'completed' &&
    project.projectOrderStatus === 'completed' &&
    project.deliveryReceiptStatus === 'completed' &&
    project.invoiceStatus === 'completed' &&
    project.ackReceiptStatus === 'completed'
  ).length;
  
  const completionRate = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;

  // Prepare revenue trend data (by month)
  const revenueTrendData = projects.reduce((acc, project) => {
    const date = new Date(project.createdDate);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    const amount = parseFloat(project.invoiceAmount) || 0;
    
    const existing = acc.find(item => item.month === monthYear);
    if (existing) {
      existing.revenue += amount;
    } else {
      acc.push({ month: monthYear, revenue: amount });
    }
    return acc;
  }, []).sort((a, b) => {
    const [aMonth, aYear] = a.month.split('/').map(Number);
    const [bMonth, bYear] = b.month.split('/').map(Number);
    return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
  });

  // Prepare project status pie chart data
  const statusData = [
    { name: 'Completed', value: completedProjects, color: '#10b981' },
    { name: 'In Progress', value: projects.length - completedProjects, color: '#f59e0b' },
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  const handleExportCSV = () => {
    toast({
      title: 'Export Feature',
      description: '🚧 This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀',
      duration: 5000,
    });
  };

  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${color} bg-opacity-10 p-3 rounded-lg`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Reports & Analytics - ProjectManager</title>
        <meta name="description" content="View detailed reports and analytics for your projects" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">View detailed reports and P&L statements.</p>
          </div>
          <Button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-xl shadow p-4">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Projects"
            value={projects.length}
            icon={FileText}
            color="text-blue-600"
          />
          <MetricCard
            title="Average Project Value"
            value={`$${formatCurrency(averageProjectValue)}`}
            icon={DollarSign}
            color="text-green-600"
          />
          <MetricCard
            title="Completion Rate"
            value={`${completionRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="text-purple-600"
          />
          <MetricCard
            title="Completed Projects"
            value={completedProjects}
            icon={FileText}
            color="text-emerald-600"
          />
        </div>

        {/* P&L Statement */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profit & Loss Statement</h2>
          <div className="space-y-4">
            {/* Revenue Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Revenue</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Invoice Amount</span>
                <span className="text-xl font-bold text-green-600">
                  ${formatCurrency(totalRevenue)}
                </span>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Expenses</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Expenses</span>
                <span className="text-xl font-bold text-red-600">
                  ${formatCurrency(totalExpenses)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Expense tracking can be added in future updates</p>
            </div>

            {/* Profit Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Net Profit</span>
                <span className="text-3xl font-bold text-green-700">
                  ${formatCurrency(profit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            {revenueTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No revenue data available
              </div>
            )}
          </div>

          {/* Project Status Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
            {projects.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No project data available
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsPage;