import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
const ProjectsOngoingTable = () => {
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
            po_number,
            customer_po_number,
            temporary_po_code,
            po_date,
            delivery_status,
            po_type,
            project_title,
            temporary_po_amount,
            quotations!inner (
              id,
              gross_amount
            ),
            
            companies (company_name)
          `
                    )
                    .eq('is_deleted', false)
                    .not('po_type', 'is', null);
                if (fetchError) throw fetchError;

                // Filter for DR status = None (Not Started) or Partial
                const filtered = (projects || []).filter((p) => {
                    const drStatus = p.delivery_status || 'Not Started';
                    return drStatus === 'Not Started' || drStatus === 'Partial';
                });
                const totalAmount = filtered.reduce((acc, item) => {
                    return acc + (Number(item.temporary_po_amount) || 0);
                }, 0);
                setTotalAmount(totalAmount);

                setData(filtered);
            } catch (err) {
                console.error('Error fetching ongoing projects:', err);
                setError('Failed to load ongoing projects.');
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
                    Ongoing Projects
                </h3>
                <span className='bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full'>
                    {data.length}
                </span>
            </div>

            {hasMissingPR && (
                <div className='px-6 pt-4 pb-2'>
                    <div className='warning'>
                        <AlertTriangle className='w-4 h-4 shrink-0' />
                        <span>
                            Warning: Some ongoing projects are missing a PR #.
                        </span>
                    </div>
                </div>
            )}

            {data.length === 0 ? (
                <div className='empty-state'>
                    No ongoing projects currently.
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>PR #</th>
                                <th>PO # / Ref</th>
                                <th>Client</th>
                                <th>Project Name</th>
                                <th>Amount</th>
                                <th>PO Date</th>
                                <th>DR Status</th>
                                <th>Project Stage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => {
                                const prRef = item.project_number || '—';
                                const poRef =
                                    item.po_number ||
                                    item.customer_po_number ||
                                    item.temporary_po_code ||
                                    'N/A';
                                const clientName =
                                    item.companies?.company_name ||
                                    'Unknown Client';
                                const projectName =
                                    item.project_title || 'Unknown Project';
                                const poDate = item.po_date
                                    ? new Date(
                                          item.po_date
                                      ).toLocaleDateString()
                                    : 'N/A';
                                const drStatus =
                                    item.delivery_status || 'Not Started';
                                const amount =
                                    item.temporary_po_amount ||
                                    item.quotations?.gross_amount ||
                                    0;

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <span className='pr-number'>
                                                {prRef}
                                            </span>
                                        </td>
                                        <td className='font-medium text-gray-900'>
                                            {poRef}
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
                                            {formatCurrency(amount)}
                                        </td>
                                        <td>{poDate}</td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${drStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {drStatus}
                                            </span>
                                        </td>
                                        <td className='text-gray-500'>
                                            PO Issued
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td colSpan={4} className='text-left'>
                                    <span className='font-bold text-gray-700'>
                                        Total Amount:
                                    </span>
                                </td>
                                <td className='amount font-bold text-gray-700'>
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
export default ProjectsOngoingTable;
