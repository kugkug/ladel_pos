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

const OverdueReceivablesTable = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: invoices, error: fetchError } = await supabase
                    .from('invoices')
                    .select(
                        `
            id,
            invoice_number,
            total_amount,
            due_date,
            status,
            invoice_issue_status,
            projects!inner (
              id,
              project_number,
              project_title,
              po_type,
              delivery_status,
              payment_status,
              is_deleted,
              companies (company_name)
            )
          `
                    )
                    .eq('is_deleted', false)
                    .eq('projects.is_deleted', false);

                if (fetchError) throw fetchError;

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const filtered = (invoices || []).filter((inv) => {
                    const p = inv.projects;
                    if (!p) return false;

                    if (!p.po_type) return false;
                    if (p.delivery_status !== 'Completed') return false;
                    if (p.payment_status === 'Paid') return false;

                    if (!inv.due_date) return false;

                    const dueDate = new Date(inv.due_date);
                    dueDate.setHours(0, 0, 0, 0);

                    return dueDate < today;
                });

                // Sort by due date ascending (most overdue first)
                filtered.sort(
                    (a, b) => new Date(a.due_date) - new Date(b.due_date)
                );

                setData(filtered);
                setTotalAmount(
                    filtered.reduce(
                        (acc, item) => acc + (Number(item.total_amount) || 0),
                        0
                    )
                );
            } catch (err) {
                console.error('Error fetching overdue receivables:', err);
                setError('Failed to load overdue receivables.');
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

    const hasMissingPR = data.some((item) => !item.projects?.project_number);

    return (
        <div className='table-section border-l-4 border-l-red-500'>
            <div className='table-header'>
                <h3 className='text-lg font-bold text-gray-900'>
                    Overdue Receivables
                </h3>
                <span className='bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full'>
                    {data.length}
                </span>
            </div>

            {hasMissingPR && (
                <div className='px-6 pt-4 pb-2'>
                    <div className='warning'>
                        <AlertTriangle className='w-4 h-4 shrink-0' />
                        <span>
                            Warning: Some overdue receivables are missing a PR
                            #.
                        </span>
                    </div>
                </div>
            )}

            {data.length === 0 ? (
                <div className='empty-state'>
                    No overdue receivables currently.
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>PR #</th>
                                <th>Invoice # / Ref</th>
                                <th>Client</th>
                                <th>Project Name</th>
                                <th className='text-right'>Amount Due (₱)</th>
                                <th>Due Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => {
                                const prRef =
                                    item.projects?.project_number || '—';
                                const clientName =
                                    item.projects?.companies?.company_name ||
                                    'Unknown Client';
                                const projectName =
                                    item.projects?.project_title ||
                                    'Unknown Project';
                                const dueDate = item.due_date
                                    ? new Date(
                                          item.due_date
                                      ).toLocaleDateString()
                                    : 'N/A';
                                const status =
                                    item.projects?.payment_status || 'Unpaid';

                                return (
                                    <tr key={item.id} className='bg-red-50/20'>
                                        <td>
                                            <span className='pr-number'>
                                                {prRef}
                                            </span>
                                        </td>
                                        <td className='font-medium text-gray-900'>
                                            {item.invoice_number}
                                        </td>
                                        <td>{clientName}</td>
                                        <td className='font-medium text-gray-900'>
                                            {projectName}
                                        </td>
                                        <td className='amount font-bold text-red-700'>
                                            {formatCurrency(item.total_amount)}
                                        </td>
                                        <td className='text-red-600 font-medium'>
                                            {dueDate}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td
                                    colSpan={4}
                                    className='font-bold text-gray-900'
                                >
                                    Total Amount Due:
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

export default OverdueReceivablesTable;
