import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { generateNextInternalCode } from '@/lib/internalCodeService';
import { saveExpense } from '@/lib/expenseService';
import { fetchSuppliers } from '@/lib/supplierService';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save } from 'lucide-react';

const MONTHS = [
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

const CHART_OF_ACCOUNTS = [
    '1_Salaries',
    '2_Rents',
    '3_Utilities',
    '4_App/Subscriptions',
    '5_Office supplies',
    '6_Fuel',
    '7_Travel expenses (Lalamove, Grab, RFID, Parking)',
    '8_Marketing',
    '9_Legal and professions',
    '10_Maintenance',
    '11_Cogs',
    '12_Interest and other financial charges',
    '13_Others',
    '14_Depreciations'
];

const financialImpactOptions = [
    { value: 'P&L', label: 'P&L' },
    { value: 'NCP', label: 'NCP' }
];

const PAYMENT_SOURCES = ['Rome', 'Alex', 'CBC', 'SB', 'LBP'];
const RECEIPT_TYPES = ['Hard Copy', 'Digital'];

const RegularExpensesForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [suppliers, setSuppliers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [internalCode, setInternalCode] = useState('');

    const [formData, setFormData] = useState({
        date_of_receipt: new Date().toISOString().split('T')[0],
        month: MONTHS[new Date().getMonth()],
        supplier_id: '',
        supplier_name: '',
        tin: '',
        address: '',
        description: '',
        amount_php: '',
        type_of_receipt: 'Hard Copy',
        chart_of_account: '5_Office supplies',
        financial_impact: 'P&L',
        valid_for_itr: false,
        valid_for_vat: false,
        valid_for_official_receipt: false,
        payment_source: 'CBC',
        notes: ''
    });

    useEffect(() => {
        const initializeData = async () => {
            try {
                const sups = await fetchSuppliers();
                setSuppliers(sups);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to load suppliers.',
                    variant: 'destructive'
                });
            }
        };
        initializeData();
    }, [toast]);

    useEffect(() => {
        const fetchPreviewCode = async () => {
            try {
                const { data, error } = await supabase.rpc(
                    'get_next_internal_code_preview'
                );
                if (!error && data) {
                    setInternalCode(data);
                }
            } catch (err) {
                console.error('Failed to fetch preview code:', err);
            }
        };
        fetchPreviewCode();
    }, []);

    const handleSupplierChange = (e) => {
        const val = e.target.value;
        if (val === 'temporary') {
            setFormData((prev) => ({
                ...prev,
                supplier_id: null,
                supplier_name: '',
                tin: '',
                address: ''
            }));
            return;
        }
        const selected = suppliers.find((s) => s.id === val);
        if (selected) {
            setFormData((prev) => ({
                ...prev,
                supplier_id: selected.id,
                supplier_name: selected.company_name,
                tin: selected.tin_number || '',
                address: selected.address || ''
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!formData.date_of_receipt)
                throw new Error('Date of Receipt is required');
            if (!formData.amount_php) throw new Error('Amount is required');
            if (!formData.supplier_name && !formData.supplier_id)
                throw new Error('Supplier name is required');
            if (!formData.description)
                throw new Error('Description is required');

            const generatedCode = await generateNextInternalCode();
            const finalData = { ...formData, internal_code: generatedCode };

            await saveExpense('regular-expenses', finalData);
            setInternalCode(generatedCode);
            setIsSaved(true);
            toast({
                title: 'Success',
                description: `Record saved with Internal Code: ${generatedCode}`
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='max-w-4xl mx-auto pb-12 animate-in fade-in duration-300'>
            <div className='flex items-center gap-4 mb-6'>
                <Button
                    variant='ghost'
                    type='button'
                    onClick={() => navigate('/expenses/data-entry')}
                    className='text-gray-500 hover:text-gray-900 -ml-2'
                >
                    <ChevronLeft className='w-4 h-4 mr-1' /> Back
                </Button>
                <div>
                    <h1 className='text-2xl font-bold text-[#1B4D5C]'>
                        Regular Expense Entry
                    </h1>
                    <p className='text-sm text-gray-500'>
                        Record standard operational and business expenses
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Section 1: Basic Info */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                    <h2 className='text-lg font-bold text-gray-900 mb-4 border-b pb-2'>
                        Basic Transaction Info
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                        <div>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Internal Code
                            </label>
                            <input
                                type='text'
                                value={internalCode || 'Loading...'}
                                readOnly
                                disabled
                                className={`w-full px-3 py-2 border rounded-lg font-mono cursor-not-allowed transition-colors ${isSaved ? 'internal-code-assigned text-lg text-center tracking-wider' : 'bg-gray-100 text-gray-700 font-bold border-gray-300'}`}
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                    Date of Receipt
                                </label>
                                <input
                                    type='date'
                                    name='date_of_receipt'
                                    required
                                    value={formData.date_of_receipt}
                                    onChange={handleChange}
                                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                                />
                            </div>
                            <div>
                                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                    Month
                                </label>
                                <select
                                    name='month'
                                    required
                                    value={formData.month}
                                    onChange={handleChange}
                                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                                >
                                    {MONTHS.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='md:col-span-2'>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Supplier Selection
                            </label>
                            <select
                                onChange={handleSupplierChange}
                                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none mb-3'
                                required
                            >
                                <option value=''>Select a supplier...</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.company_name}
                                    </option>
                                ))}
                                <option value='temporary'>
                                    + Add Temporary Supplier
                                </option>
                            </select>
                        </div>

                        {!formData.supplier_id &&
                            formData.supplier_id !== '' && (
                                <div className='md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200'>
                                    <div>
                                        <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                            Supplier Name
                                        </label>
                                        <input
                                            type='text'
                                            name='supplier_name'
                                            required
                                            value={formData.supplier_name}
                                            onChange={handleChange}
                                            placeholder='Enter name'
                                            className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                            TIN
                                        </label>
                                        <input
                                            type='text'
                                            name='tin'
                                            value={formData.tin}
                                            onChange={handleChange}
                                            placeholder='Optional'
                                            className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                            Address
                                        </label>
                                        <input
                                            type='text'
                                            name='address'
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder='Optional'
                                            className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                                        />
                                    </div>
                                </div>
                            )}

                        <div className='md:col-span-2'>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Description
                            </label>
                            <input
                                type='text'
                                name='description'
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder='What was purchased?'
                                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Amount (PHP)
                            </label>
                            <input
                                type='number'
                                step='0.01'
                                name='amount_php'
                                required
                                value={formData.amount_php}
                                onChange={handleChange}
                                placeholder='0.00'
                                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none font-bold text-[#1B4D5C]'
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Accounting & Tax */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                    <h2 className='text-lg font-bold text-gray-900 mb-4 border-b pb-2'>
                        Accounting & Tax
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                        <div>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Chart of Account
                            </label>
                            <select
                                name='chart_of_account'
                                value={formData.chart_of_account}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                            >
                                {CHART_OF_ACCOUNTS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Financial Impact
                            </label>
                            <select
                                name='financial_impact'
                                value={formData.financial_impact}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                            >
                                {financialImpactOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Payment Source
                            </label>
                            <select
                                name='payment_source'
                                value={formData.payment_source}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                            >
                                {PAYMENT_SOURCES.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Type of Receipt
                            </label>
                            <select
                                name='type_of_receipt'
                                value={formData.type_of_receipt}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                            >
                                {RECEIPT_TYPES.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='flex gap-3 '>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    name='valid_for_itr'
                                    checked={formData.valid_for_itr}
                                    onChange={handleChange}
                                    className='w-4 h-4 rounded border-gray-300 text-[#1B4D5C] focus:ring-[#1B4D5C]'
                                />
                                <span className='text-sm font-medium text-gray-700'>
                                    VAT Register
                                </span>
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    name='valid_for_vat'
                                    checked={formData.valid_for_vat}
                                    onChange={handleChange}
                                    className='w-4 h-4 rounded border-gray-300 text-[#1B4D5C] focus:ring-[#1B4D5C]'
                                />
                                <span className='text-sm font-medium text-gray-700'>
                                    No VAT
                                </span>
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    name='valid_for_official_receipt'
                                    checked={
                                        formData.valid_for_official_receipt ||
                                        false
                                    }
                                    onChange={handleChange}
                                    className='w-4 h-4 rounded border-gray-300 text-[#1B4D5C] focus:ring-[#1B4D5C]'
                                />
                                <span className='text-sm font-medium text-gray-700'>
                                    No Official Receipt
                                </span>
                            </label>
                        </div>

                        <div className='md:col-span-2'>
                            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                                Notes
                            </label>
                            <textarea
                                name='notes'
                                rows={3}
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder='Any additional details...'
                                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4D5C] outline-none'
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => navigate('/expenses/data-entry')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isSaved}
                        className='bg-[#1B4D5C] hover:bg-[#11313A] text-white'
                    >
                        {isSubmitting ? (
                            'Saving...'
                        ) : isSaved ? (
                            'Saved'
                        ) : (
                            <>
                                <Save className='w-4 h-4 mr-2' /> Save Expense
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RegularExpensesForm;
