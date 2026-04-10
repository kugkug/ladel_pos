import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Download,
    Eye,
    Edit,
    Trash2,
    Plus,
    Filter,
    X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { getActiveExpenses, deleteExpense } from '@/lib/expenseService';
import { useAuth } from '@/contexts/AuthContext';
import ExpenseEditModal from './ExpenseEditModal';
import { exportToCSV, generateFilename } from '@/lib/csvExport';

const MONTHS = [
    'All Months',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB'); // Formats as DD/MM/YYYY
};

const formatBool = (val) => {
    if (val === undefined || val === null) return '—';
    return val ? 'Yes' : 'No';
};

const InfoField = ({ label, value, className = '' }) => (
    <div className={className}>
        <p className='text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1'>
            {label}
        </p>
        <p className='text-sm font-medium text-gray-900'>{value || '—'}</p>
    </div>
);

const ExpensesList = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { isOwner, userRole } = useAuth();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterMonth, setFilterMonth] = useState('All Months');

    const [previewExpense, setPreviewExpense] = useState(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getActiveExpenses();
            setExpenses(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load active expenses.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const getEntityName = (exp) => {
        const { data } = exp;
        if (exp.type === 'regular-expenses')
            return data.supplier_name || 'Unknown Supplier';
        if (exp.type === 'capitalisation') return data.fund_by || 'Unknown';
        if (exp.type === 'reimbursement')
            return data.reimbursed_by || 'Unknown';
        if (exp.type === 'dividends') return data.paid_to || 'Unknown';
        return '-';
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'regular-expenses':
                return 'Regular Expense';
            case 'reimbursement':
                return 'Reimbursement';
            case 'capitalisation':
                return 'Capitalisation';
            case 'dividends':
                return 'Dividends';
            default:
                return 'Unknown';
        }
    };

    const getBadgeColor = (type) => {
        switch (type) {
            case 'regular-expenses':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'reimbursement':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'capitalisation':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'dividends':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleEdit = (exp) => {
        setEditingExpense(exp);
        setEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (
            window.confirm(
                'Are you sure you want to move this expense to the trash bin?'
            )
        ) {
            try {
                await deleteExpense(id);
                toast({
                    title: 'Moved to Trash',
                    description: 'Expense successfully moved to trash.'
                });
                setExpenses((prev) => prev.filter((e) => e.id !== id));
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete expense.',
                    variant: 'destructive'
                });
            }
        }
    };

    const getAmount = (exp) => Number(exp.data.amount_php || 0);
    const getDate = (exp) =>
        exp.data.date_of_receipt || exp.data.date_of_transaction || 'N/A';
    const getDesc = (exp) => exp.data.description || exp.data.notes || '';

    /** Single search box matches any of these fields (case-insensitive, partial). */
    const buildExpenseSearchHaystack = (exp) => {
        const d = exp.data || {};
        const amt = getAmount(exp);
        const parts = [
            exp.internal_code,
            getEntityName(exp),
            getDesc(exp),
            getTypeLabel(exp.type),
            d.supplier_name,
            d.supplier_tin,
            d.address,
            d.description,
            d.notes,
            d.payment_source,
            d.bank_source,
            d.bank_funded,
            d.payment_method,
            d.fund_by,
            d.reimbursed_by,
            d.paid_to,
            d.chart_of_account,
            d.financial_impact,
            d.type_of_receipt,
            d.month,
            Number.isFinite(amt) ? String(amt) : '',
            Number.isFinite(amt) ? amt.toFixed(2) : '',
            Number.isFinite(amt)
                ? amt.toLocaleString('en-PH', { minimumFractionDigits: 2 })
                : '',
            d.amount_php != null && d.amount_php !== ''
                ? String(d.amount_php)
                : ''
        ];

        // Regular expense compliance (form labels: VAT Register, No VAT, No Official Receipt)
        if (exp.type === 'regular-expenses') {
            if (d.valid_for_itr === true) {
                parts.push('vat register', 'itr');
            }
            if (d.valid_for_vat === true) {
                parts.push('no vat', 'non-vat');
            }
            if (d.valid_for_vat === false) {
                parts.push('valid for vat', 'vat');
            }
            if (d.valid_for_official_receipt === true) {
                parts.push('no official receipt');
            }
            if (d.valid_for_official_receipt === false) {
                parts.push('official receipt');
            }
        }

        return parts
            .filter((p) => p != null && String(p).trim() !== '')
            .join(' ')
            .toLowerCase();
    };

    // Filter the list
    const filteredExpenses = expenses.filter((exp) => {
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch =
            q === '' || buildExpenseSearchHaystack(exp).includes(q);
        const matchesType = filterType === 'All' || exp.type === filterType;
        const matchesMonth =
            filterMonth === 'All Months' || exp.data.month === filterMonth;
        return matchesSearch && matchesType && matchesMonth;
    });

    // Sort by internal_code descending (newest first based on sequence)
    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        const codeA = a.internal_code || '';
        const codeB = b.internal_code || '';
        return codeB.localeCompare(codeA);
    });

    const isFiltering =
        filterType !== 'All' ||
        filterMonth !== 'All Months' ||
        searchTerm !== '';

    const canDelete = isOwner() || userRole === 'ADMIN';

    const handleExportExpenses = () => {
        if (sortedExpenses.length === 0) {
            toast({ title: 'Notice', description: 'No expenses to export.' });
            return;
        }

        const headers = [
            'Internal Code',
            'Date',
            'Month',
            'Classification',
            'Supplier',
            'Amount',
            'Description',
            'Status',
            'Created By',
            'Created Date'
        ];

        const data = sortedExpenses.map((exp) => [
            exp.internal_code || '',
            getDate(exp),
            exp.data.month || '',
            getTypeLabel(exp.type),
            getEntityName(exp),
            getAmount(exp).toString(),
            getDesc(exp),
            exp.is_deleted ? 'Deleted' : 'Active',
            exp.created_by || '',
            exp.created_at ? new Date(exp.created_at).toLocaleDateString() : ''
        ]);

        exportToCSV(data, generateFilename('Expenses'), headers);
        toast({
            title: 'Success',
            description: `Exported ${sortedExpenses.length} expenses successfully.`
        });
    };

    return (
        <>
            <Helmet>
                <title>Expenses List</title>
            </Helmet>
            <div className='space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold text-[#1B4D5C]'>
                            Expenses List
                        </h1>
                        <p className='text-gray-500 mt-1'>
                            View and manage all active financial records (
                            {expenses.length} total)
                        </p>
                    </div>
                    <div className='flex gap-3'>
                        <Button
                            onClick={handleExportExpenses}
                            className='bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-md transition-all'
                        >
                            <Download className='w-4 h-4 mr-2' /> Export CSV
                        </Button>
                        <Button
                            onClick={() => navigate('/expenses/data-entry')}
                            className='bg-[#1B4D5C] hover:bg-[#11313A] text-white shadow-md transition-all h-10'
                        >
                            <Plus className='w-4 h-4 mr-2' /> Add Expense
                        </Button>
                    </div>
                </div>

                <div className='flex gap-4 border-b border-gray-200'>
                    <button className='pb-2 px-1 font-semibold text-sm transition-all duration-300 border-b-[3px] border-[#1B4D5C] text-[#1B4D5C]'>
                        Active Expenses
                    </button>
                    <button
                        onClick={() => navigate('/expenses/trash-bin')}
                        className='pb-2 px-1 font-semibold text-sm transition-all duration-300 flex items-center text-gray-500 hover:text-gray-900 border-b-[3px] border-transparent'
                    >
                        Trash Bin
                    </button>
                </div>

                <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all'>
                    <div className='flex flex-col md:flex-row gap-4 justify-between items-center'>
                        <div className='relative w-full md:w-96 flex-shrink-0'>
                            <Search className='absolute left-3 top-2.5 w-5 h-5 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Search: internal code, description, supplier, payment source, VAT / receipt flags, amount…'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#1B4D5C] bg-gray-50 outline-none transition-all'
                            />
                        </div>

                        <div className='flex flex-wrap items-center gap-3 w-full md:w-auto'>
                            <div className='flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1'>
                                <Filter className='w-4 h-4 text-gray-400 mx-2' />
                                <select
                                    value={filterMonth}
                                    onChange={(e) =>
                                        setFilterMonth(e.target.value)
                                    }
                                    className='bg-transparent border-none py-1.5 pr-8 pl-2 text-sm font-medium text-gray-900 outline-none focus:ring-0 cursor-pointer'
                                >
                                    {MONTHS.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className='px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1B4D5C] transition-all'
                            >
                                <option value='All'>All Types</option>
                                <option value='regular-expenses'>
                                    Regular Expense
                                </option>
                                <option value='reimbursement'>
                                    Reimbursement
                                </option>
                                <option value='capitalisation'>
                                    Capitalisation
                                </option>
                                <option value='dividends'>Dividends</option>
                            </select>

                            {isFiltering && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                        setFilterType('All');
                                        setFilterMonth('All Months');
                                        setSearchTerm('');
                                    }}
                                    className='text-gray-500 hover:text-red-600'
                                >
                                    <X className='w-4 h-4 mr-1' /> Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse min-w-max'>
                            <thead>
                                <tr className='bg-teal-700 text-white'>
                                    <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider'>
                                        Internal Code
                                    </th>
                                    <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider'>
                                        Date / Month
                                    </th>
                                    <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider'>
                                        Classification
                                    </th>
                                    <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider'>
                                        Supplier
                                    </th>
                                    <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider'>
                                        Amount (₱)
                                    </th>
                                    <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center w-32'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan='6'
                                            className='px-6 py-12 text-center text-gray-500 font-medium'
                                        >
                                            Loading active expenses...
                                        </td>
                                    </tr>
                                ) : sortedExpenses.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan='6'
                                            className='px-6 py-12 text-center text-gray-500 font-medium'
                                        >
                                            No records found matching your
                                            filters.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedExpenses.map((exp) => (
                                        <tr
                                            key={exp.id}
                                            className='hover:bg-gray-50 transition-colors group'
                                        >
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-blue-600 bg-blue-50/30 rounded-l-lg border-y border-l border-transparent group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors'>
                                                {exp.internal_code || 'N/A'}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-y border-transparent group-hover:border-blue-100'>
                                                <div className='font-bold'>
                                                    {getDate(exp)}
                                                </div>
                                                <div className='text-xs text-gray-500 mt-0.5'>
                                                    {exp.data.month}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap border-y border-transparent group-hover:border-blue-100'>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getBadgeColor(exp.type)}`}
                                                >
                                                    {getTypeLabel(exp.type)}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1B4D5C] border-y border-transparent group-hover:border-blue-100'>
                                                {getEntityName(exp)}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1B4D5C] border-y border-transparent group-hover:border-blue-100'>
                                                ₱
                                                {getAmount(exp).toLocaleString(
                                                    undefined,
                                                    { minimumFractionDigits: 2 }
                                                )}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-center rounded-r-lg border-y border-r border-transparent group-hover:border-blue-100'>
                                                <div className='flex flex-col items-center justify-center'>
                                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5'>
                                                        Preview
                                                    </span>
                                                    <div className='flex items-center justify-center gap-1.5'>
                                                        <button
                                                            onClick={() =>
                                                                setPreviewExpense(
                                                                    exp
                                                                )
                                                            }
                                                            className='text-teal-600 hover:text-teal-800 p-1.5 rounded-md hover:bg-teal-50 transition-colors'
                                                            title='Preview'
                                                        >
                                                            <Eye className='w-4 h-4' />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleEdit(exp)
                                                            }
                                                            className='text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 transition-colors'
                                                            title='Edit'
                                                        >
                                                            <Edit className='w-4 h-4' />
                                                        </button>

                                                        {canDelete && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        exp.id
                                                                    )
                                                                }
                                                                className='text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors'
                                                                title='Move to Trash'
                                                            >
                                                                <Trash2 className='w-4 h-4' />
                                                            </button>
                                                        )}
                                                    </div>
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

            <Dialog
                open={!!previewExpense}
                onOpenChange={(open) => !open && setPreviewExpense(null)}
            >
                <DialogContent className='max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]'>
                    {previewExpense &&
                        (() => {
                            const data = previewExpense.data || {};
                            const type = previewExpense.type;

                            return (
                                <>
                                    <DialogHeader className='border-b pb-4 px-2 shrink-0'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <DialogTitle className='text-2xl font-bold text-[#1B4D5C]'>
                                                    Expense Details
                                                </DialogTitle>
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getBadgeColor(type)}`}
                                                >
                                                    {getTypeLabel(type)}
                                                </span>
                                            </div>
                                        </div>
                                        <DialogDescription className='sr-only'>
                                            Detailed view of the selected
                                            expense
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className='overflow-y-auto px-2 py-4 space-y-6 flex-grow custom-scrollbar'>
                                        {/* Core Information Section */}
                                        <section>
                                            <h4 className='text-sm font-bold text-[#1B4D5C] border-b border-gray-200 pb-2 mb-4 flex items-center'>
                                                <div className='w-2 h-2 rounded-full bg-[#1B4D5C] mr-2'></div>
                                                Core Information
                                            </h4>
                                            <div className='grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100'>
                                                <div className='col-span-1'>
                                                    <p className='text-xs text-blue-600 uppercase tracking-wider font-semibold mb-1'>
                                                        Expense Code
                                                    </p>
                                                    <p className='text-sm font-bold font-mono text-blue-700 bg-blue-50 py-1 px-2 rounded inline-block'>
                                                        {previewExpense.internal_code ||
                                                            '—'}
                                                    </p>
                                                </div>
                                                <InfoField
                                                    label='Date'
                                                    value={formatDate(
                                                        data.date_of_receipt ||
                                                            data.date_of_transaction
                                                    )}
                                                />
                                                <InfoField
                                                    label='Month'
                                                    value={data.month}
                                                />
                                            </div>
                                        </section>

                                        {/* Party/Supplier Information Section */}
                                        <section>
                                            <h4 className='text-sm font-bold text-[#1B4D5C] border-b border-gray-200 pb-2 mb-4 flex items-center'>
                                                <div className='w-2 h-2 rounded-full bg-[#1B4D5C] mr-2'></div>
                                                Party Information
                                            </h4>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100'>
                                                {type ===
                                                    'regular-expenses' && (
                                                    <>
                                                        <InfoField
                                                            label='Supplier Name'
                                                            value={
                                                                data.supplier_name
                                                            }
                                                        />
                                                        <InfoField
                                                            label='Supplier TIN'
                                                            value={
                                                                data.tin ||
                                                                data.supplier_tin
                                                            }
                                                        />
                                                        <InfoField
                                                            label='Supplier Address'
                                                            value={
                                                                data.address ||
                                                                data.supplier_address
                                                            }
                                                            className='md:col-span-2'
                                                        />
                                                    </>
                                                )}
                                                {type === 'reimbursement' && (
                                                    <InfoField
                                                        label='Reimbursed By'
                                                        value={
                                                            data.reimbursed_by
                                                        }
                                                    />
                                                )}
                                                {type === 'capitalisation' && (
                                                    <InfoField
                                                        label='Fund By'
                                                        value={data.fund_by}
                                                    />
                                                )}
                                                {type === 'dividends' && (
                                                    <InfoField
                                                        label='Paid To'
                                                        value={data.paid_to}
                                                    />
                                                )}
                                            </div>
                                        </section>

                                        {/* Expense Details Section */}
                                        <section>
                                            <h4 className='text-sm font-bold text-[#1B4D5C] border-b border-gray-200 pb-2 mb-4 flex items-center'>
                                                <div className='w-2 h-2 rounded-full bg-[#1B4D5C] mr-2'></div>
                                                Expense Details
                                            </h4>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100'>
                                                <div className='md:col-span-2 mb-2'>
                                                    <p className='text-xs text-[#1B4D5C] uppercase tracking-wider font-bold mb-1'>
                                                        Amount (PHP)
                                                    </p>
                                                    <p className='font-bold text-[#1B4D5C] text-3xl tracking-tight'>
                                                        ₱
                                                        {Number(
                                                            data.amount_php || 0
                                                        ).toLocaleString(
                                                            undefined,
                                                            {
                                                                minimumFractionDigits: 2
                                                            }
                                                        )}
                                                    </p>
                                                </div>

                                                {data.description && (
                                                    <InfoField
                                                        label='Description'
                                                        value={data.description}
                                                        className='md:col-span-2'
                                                    />
                                                )}

                                                {type ===
                                                    'regular-expenses' && (
                                                    <>
                                                        <InfoField
                                                            label='Chart of Account'
                                                            value={
                                                                data.chart_of_account
                                                            }
                                                        />
                                                        <InfoField
                                                            label='Financial Impact'
                                                            value={
                                                                data.financial_impact
                                                            }
                                                        />
                                                        <InfoField
                                                            label='Type of Receipt'
                                                            value={
                                                                data.type_of_receipt
                                                            }
                                                        />
                                                    </>
                                                )}
                                                {type === 'reimbursement' && (
                                                    <InfoField
                                                        label='Type of Receipt'
                                                        value={
                                                            data.type_of_receipt
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </section>

                                        {/* Compliance Section */}
                                        {type === 'regular-expenses' &&
                                            (data.valid_for_itr !== undefined ||
                                                data.valid_for_vat !==
                                                    undefined) && (
                                                <section>
                                                    <h4 className='text-sm font-bold text-[#1B4D5C] border-b border-gray-200 pb-2 mb-4 flex items-center'>
                                                        <div className='w-2 h-2 rounded-full bg-[#1B4D5C] mr-2'></div>
                                                        Compliance
                                                    </h4>
                                                    <div className='grid grid-cols-2 gap-y-4 gap-x-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100'>
                                                        <InfoField
                                                            label='Valid for ITR'
                                                            value={formatBool(
                                                                data.valid_for_itr
                                                            )}
                                                        />
                                                        <InfoField
                                                            label='Valid for VAT'
                                                            value={formatBool(
                                                                data.valid_for_vat
                                                            )}
                                                        />
                                                    </div>
                                                </section>
                                            )}

                                        {/* Additional Fields Section */}
                                        <section>
                                            <h4 className='text-sm font-bold text-[#1B4D5C] border-b border-gray-200 pb-2 mb-4 flex items-center'>
                                                <div className='w-2 h-2 rounded-full bg-[#1B4D5C] mr-2'></div>
                                                Additional Information
                                            </h4>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100'>
                                                {data.payment_source && (
                                                    <InfoField
                                                        label='Payment Source'
                                                        value={
                                                            data.payment_source
                                                        }
                                                    />
                                                )}
                                                {data.bank_source && (
                                                    <InfoField
                                                        label='Bank Source'
                                                        value={data.bank_source}
                                                    />
                                                )}
                                                {data.bank_funded && (
                                                    <InfoField
                                                        label='Bank Funded To'
                                                        value={data.bank_funded}
                                                    />
                                                )}
                                                {data.payment_method && (
                                                    <InfoField
                                                        label='Payment Method'
                                                        value={
                                                            data.payment_method
                                                        }
                                                    />
                                                )}

                                                <div className='md:col-span-2'>
                                                    <p className='text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1'>
                                                        Notes
                                                    </p>
                                                    <div className='text-sm bg-white p-3 rounded-lg border border-gray-200 text-gray-800 min-h-[80px] whitespace-pre-wrap'>
                                                        {data.notes || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    <div className='border-t pt-4 px-2 shrink-0 flex justify-end'>
                                        <Button
                                            variant='outline'
                                            onClick={() =>
                                                setPreviewExpense(null)
                                            }
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </>
                            );
                        })()}
                </DialogContent>
            </Dialog>

            <ExpenseEditModal
                expense={editingExpense}
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditingExpense(null);
                }}
                onSave={fetchData}
            />
        </>
    );
};

export default ExpensesList;
