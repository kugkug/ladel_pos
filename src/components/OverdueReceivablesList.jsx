import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/dashboardDataUtils';
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

const OverdueReceivablesList = ({ data, isLoading, error }) => {
  const navigate = useNavigate();
  const displayData = data?.slice(0, 10) || [];

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <AlertCircle className="w-6 h-6 mb-2" />
        <p className="font-semibold">Failed to load overdue receivables</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" /> Overdue Receivables
          </h3>
          <p className="text-sm text-gray-500 mt-1">Payments that have passed their due date</p>
        </div>
        {data?.length > 10 && (
          <Button variant="outline" size="sm" className="text-sm font-semibold">
            View All ({data.length})
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Customer</TableHead>
              <TableHead className="font-semibold text-gray-700">Invoice No.</TableHead>
              <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Amount</TableHead>
              <TableHead className="font-semibold text-gray-700">Days Overdue</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
                  <span className="text-gray-500">Loading records...</span>
                </TableCell>
              </TableRow>
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500 font-medium">
                  No overdue receivables 🎉
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((item) => (
                <TableRow key={item.id} className="hover:bg-red-50/40 transition-colors">
                  <TableCell className="font-medium text-gray-900">{item.customerName}</TableCell>
                  <TableCell className="text-gray-600">{item.invoiceNumber}</TableCell>
                  <TableCell className="text-gray-600">
                    {item.dueDate ? format(new Date(item.dueDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">{formatCurrency(item.amount)}</TableCell>
                  <TableCell>
                    <span className="badge-overdue">{item.daysOverdue} Days</span>
                  </TableCell>
                  <TableCell>
                    <span className="badge-pending">Unpaid</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => navigate(`/sales/projects/${item.projectId}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" /> Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OverdueReceivablesList;