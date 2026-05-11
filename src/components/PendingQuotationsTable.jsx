import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};
const PendingQuotationsTable = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: projects, error: fetchError } = await supabase
                    .from('projects')
                    .select(
                        `
            id,
            project_number,
            project_title,
            po_type,
            is_deleted,
            quotations!inner (
              id,
              quotation_number,
              gross_amount,
              quotation_status,
              is_deleted
            ),
            
            companies (company_name)
          `
                    )
                    .eq('is_deleted', false)
                    .eq('quotations.is_deleted', false)
                    .is('po_type', null);
                if (fetchError) throw fetchError;

                // Filter projects that actually have a quotation and no PO
                const filtered = (projects || []).filter(
                    (p) =>
                        p.quotations &&
                        p.quotations.quotation_status === 'Pending'
                );
                setData(filtered);
                setTotalAmount(
                    filtered.reduce(
                        (acc, item) =>
                            acc + (Number(item.quotations.gross_amount) || 0),
                        0
                    )
                );
            } catch (err) {
                console.error('Error fetching pending quotations:', err);
                setError('Failed to load pending quotations.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    if (isLoading) {
        return (
            <div className='table-section p-6 flex justify-center items-center h-40'>
                <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
            </div>
        );
    }
    if (error) {
        return (
            <div className='table-section p-6 text-center text-red-600 error'>
                {error}
            </div>
        );
    }
    const hasMissingPR = data.some((item) => !item.project_number);
    return (
        <div className='table-section'>
            <div className='table-header'>
                <h3 className='text-lg font-bold text-gray-900'>
                    Pending Quotations
                </h3>
                <span className='bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full'>
                    {data.length}
                </span>
            </div>

            {hasMissingPR && (
                <div className='px-6 pt-4 pb-2'>
                    <div className='warning'>
                        <AlertTriangle className='w-4 h-4 shrink-0' />
                        <span>
                            Warning: Some pending quotations are missing a PR #.
                        </span>
                    </div>
                </div>
            )}

            {data.length === 0 ? (
                <div className='empty-state'>
                    No pending quotations currently.
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>PR #</th>
                                <th>Quotation # / Ref</th>
                                <th>Client</th>
                                <th>Project Name</th>
                                <th className='text-right'>Amount (₱)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => {
                                const prRef = item.project_number || '—';
                                const qt = item.quotations;
                                const clientName =
                                    item.companies?.company_name ||
                                    'Unknown Client';
                                const projectName =
                                    item.project_title || 'Unknown Project';
                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <span className='pr-number'>
                                                {prRef}
                                            </span>
                                        </td>
                                        <td className='font-medium text-gray-900'>
                                            {qt.quotation_number}
                                        </td>
                                        <td>{clientName}</td>
                                        <td className='font-medium text-gray-900 whitespace-pre-line break-words max-w-xs'>
                                            <span
                                                style={{
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-line',
                                                    display: 'block'
                                                }}
                                            >
                                                {projectName}
                                            </span>
                                        </td>
                                        <td className='amount font-bold text-gray-700'>
                                            {formatCurrency(qt.gross_amount)}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${qt.quotation_status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                                            >
                                                {qt.quotation_status ||
                                                    'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td
                                    colSpan={4}
                                    className='text-left font-bold text-gray-900 font-semibold'
                                >
                                    Total Amount:
                                </td>
                                <td className='text-right font-bold text-gray-900 font-semibold'>
                                    {formatCurrency(totalAmount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default PendingQuotationsTable;
