import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { formatPHP, generateMonths, getMonthKey, parseAmount } from '@/lib/reportUtils';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/lib/csvExport';
import '@/styles/reports.css';

const GrossSalesReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentYear = Math.max(2026, new Date().getFullYear());
  const allMonths = generateMonths(2025, 0, currentYear, 11);
  
  const [fromMonth, setFromMonth] = useState('2025-01');
  const [toMonth, setToMonth] = useState(`${currentYear}-12`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*, company:companies(company_name)')
          .not('po_number', 'is', null)
          .eq('is_deleted', false);

        if (error) throw error;

        const formatted = projects.map(p => {
          const poDate = p.po_created_at || p.po_date;
          const amount = parseAmount(p.po_amount_inclusive);
          const monthKey = getMonthKey(poDate);

          return {
            id: p.id,
            companyName: p.company?.company_name || 'Unknown',
            prNumber: p.project_number,
            poNumber: p.po_number,
            projectTitle: p.project_title,
            poIssued: poDate ? format(new Date(poDate), 'MM/dd/yyyy') : '-',
            amount: amount,
            monthKey: monthKey
          };
        });

        setData(formatted);
      } catch (err) {
        console.error("Error fetching gross sales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fromIndex = allMonths.findIndex(m => m.key === fromMonth);
  const toIndex = allMonths.findIndex(m => m.key === toMonth);
  const startIdx = Math.min(fromIndex, toIndex);
  const endIdx = Math.max(fromIndex, toIndex);
  const filteredMonths = allMonths.slice(startIdx, endIdx + 1);

  const displayData = data.filter(row => filteredMonths.some(m => m.key === row.monthKey));

  // Grouping by company name
  const groupedData = displayData.reduce((acc, row) => {
    if (!acc[row.companyName]) acc[row.companyName] = [];
    acc[row.companyName].push(row);
    return acc;
  }, {});
  
  const sortedCompanies = Object.keys(groupedData).sort();

  const totals = { grandTotal: 0 };
  filteredMonths.forEach(m => totals[m.key] = 0);

  displayData.forEach(row => {
    totals[row.monthKey] += row.amount;
    totals.grandTotal += row.amount;
  });

  const handleDownloadCSV = () => {
    const headers = [
      'Company Name', 'PR Number', 'PO Number', 'Project Title', 'PO Issued',
      ...filteredMonths.map(m => m.label),
      'Grand Total'
    ];

    const csvData = displayData.map(row => {
      const rowTotal = row.amount;
      return [
        row.companyName,
        row.prNumber,
        row.poNumber,
        row.projectTitle,
        row.poIssued,
        ...filteredMonths.map(m => row.monthKey === m.key ? row.amount : 0),
        rowTotal
      ];
    });

    const totalRow = ['GRAND TOTAL', '', '', '', ''];
    filteredMonths.forEach(m => totalRow.push(totals[m.key] || 0));
    totalRow.push(totals.grandTotal || 0);
    csvData.push(totalRow);

    const startLabel = allMonths[startIdx].label.replace(' ', '');
    const endLabel = allMonths[endIdx].label.replace(' ', '');
    exportToCSV(csvData, `GrossSales_${startLabel}_${endLabel}.csv`, headers);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading report data...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-xl border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">From:</span>
          <select 
            value={fromMonth} 
            onChange={(e) => setFromMonth(e.target.value)}
            className="border border-gray-300 rounded-md text-sm py-1.5 px-3 focus:ring-primary focus:border-primary outline-none"
          >
            {allMonths.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
          
          <span className="text-sm font-semibold text-gray-600 ml-2">To:</span>
          <select 
            value={toMonth} 
            onChange={(e) => setToMonth(e.target.value)}
            className="border border-gray-300 rounded-md text-sm py-1.5 px-3 focus:ring-primary focus:border-primary outline-none"
          >
            {allMonths.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={handleDownloadCSV} className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all text-sm h-9">
          <Download className="w-4 h-4 mr-2" /> Download CSV
        </Button>
      </div>

      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th className="sticky-header frozen-company-column min-w-[200px]">Company Name</th>
              <th className="sticky-header min-w-[120px]">PR Number</th>
              <th className="sticky-header min-w-[120px]">PO Number</th>
              <th className="sticky-header min-w-[250px]">Project Title</th>
              <th className="sticky-header min-w-[120px]">PO Issued</th>
              {filteredMonths.map(m => (
                <th key={m.key} className="sticky-header min-w-[140px] text-right">{m.label}</th>
              ))}
              <th className="sticky-header min-w-[160px] text-right font-bold text-primary">Grand Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedCompanies.length === 0 ? (
              <tr><td colSpan={100} className="text-center py-8 text-gray-500">No data available for this report.</td></tr>
            ) : (
              sortedCompanies.map(company => (
                <React.Fragment key={company}>
                  <tr className="group-header-row">
                    <td colSpan={100} className="frozen-company-column">
                      Company: {company}
                    </td>
                  </tr>
                  {groupedData[company].map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="frozen-company-column font-medium">{row.companyName}</td>
                      <td><span className="pr-number text-primary font-medium">{row.prNumber}</span></td>
                      <td>{row.poNumber}</td>
                      <td className="truncate max-w-[250px]">{row.projectTitle}</td>
                      <td>{row.poIssued}</td>
                      {filteredMonths.map(m => (
                        <td key={m.key} className="text-right tabular-nums text-green-700 font-medium">
                          {row.monthKey === m.key ? formatPHP(row.amount) : '-'}
                        </td>
                      ))}
                      <td className="text-right font-bold text-primary tabular-nums">{formatPHP(row.amount)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
          {displayData.length > 0 && (
            <tfoot>
              <tr className="report-footer">
                <td colSpan={5} className="frozen-company-column text-left text-gray-800">GRAND TOTAL</td>
                {filteredMonths.map(m => (
                  <td key={m.key} className="text-right text-green-700">{formatPHP(totals[m.key])}</td>
                ))}
                <td className="text-right text-primary">{formatPHP(totals.grandTotal)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default GrossSalesReport;