import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { updateExpense } from '@/lib/expenseService';

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

const FINANCIAL_IMPACTS = ['P&L', 'Not P&L', 'NCP'];
const PAYMENT_SOURCES = ['Rome', 'Alex', 'CBC', 'SB', 'LBP'];
const RECEIPT_TYPES = ['Hard Copy', 'Digital'];

const ExpenseEditModal = ({ expense, isOpen, onClose, onSave }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (expense && isOpen) {
            setFormData(expense.data || {});
        }
    }, [expense, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCheckedChange = (name, checked) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateExpense(expense.id, formData);
            toast({
                title: 'Success',
                description: 'Expense updated successfully.'
            });
            onSave();
            onClose();
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

    if (!expense) return null;

    const renderFormFields = () => {
        switch (expense.type) {
            case 'regular-expenses':
                return (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label>Date of Receipt</Label>
                            <input
                                type='date'
                                name='date_of_receipt'
                                required
                                value={formData.date_of_receipt || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Month</Label>
                            <select
                                name='month'
                                required
                                value={formData.month || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {MONTHS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2 md:col-span-2'>
                            <Label>Supplier Name</Label>
                            <Input
                                type='text'
                                name='supplier_name'
                                required
                                value={formData.supplier_name || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2 md:col-span-2'>
                            <Label>Description</Label>
                            <Input
                                type='text'
                                name='description'
                                required
                                value={formData.description || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Amount (PHP)</Label>
                            <Input
                                type='number'
                                step='0.01'
                                name='amount_php'
                                required
                                value={formData.amount_php || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Chart of Account</Label>
                            <select
                                name='chart_of_account'
                                value={formData.chart_of_account || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                <option value=''>Select Category</option>
                                {CHART_OF_ACCOUNTS.map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Financial Impact</Label>
                            <select
                                name='financial_impact'
                                value={formData.financial_impact || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {FINANCIAL_IMPACTS.map((f) => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Payment Source</Label>
                            <select
                                name='payment_source'
                                value={formData.payment_source || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {PAYMENT_SOURCES.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Type of Receipt</Label>
                            <select
                                name='type_of_receipt'
                                value={formData.type_of_receipt || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {RECEIPT_TYPES.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='flex flex-col gap-2 justify-center pt-6'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='valid_for_itr'
                                    checked={formData.valid_for_itr || false}
                                    onCheckedChange={(c) =>
                                        handleCheckedChange('valid_for_itr', c)
                                    }
                                />
                                <Label htmlFor='valid_for_itr'>
                                    VAT Register
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='valid_for_vat'
                                    checked={formData.valid_for_vat || false}
                                    onCheckedChange={(c) =>
                                        handleCheckedChange('valid_for_vat', c)
                                    }
                                />
                                <Label htmlFor='valid_for_vat'>
                                    No VAT
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='valid_for_official_receipt'
                                    checked={
                                        formData.valid_for_official_receipt ||
                                        false
                                    }
                                    onCheckedChange={(c) =>
                                        handleCheckedChange(
                                            'valid_for_official_receipt',
                                            c
                                        )
                                    }
                                />
                                <Label htmlFor='valid_for_official_receipt'>
                                    No Official Receipt
                                </Label>
                            </div>
                        </div>
                    </div>
                );

            case 'reimbursement':
                return (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label>Date of Transaction</Label>
                            <input
                                type='date'
                                name='date_of_transaction'
                                required
                                value={formData.date_of_transaction || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Month</Label>
                            <select
                                name='month'
                                required
                                value={formData.month || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {MONTHS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Reimbursed By</Label>
                            <Input
                                type='text'
                                name='reimbursed_by'
                                required
                                value={formData.reimbursed_by || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Bank Source</Label>
                            <select
                                name='bank_source'
                                required
                                value={formData.bank_source || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {PAYMENT_SOURCES.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Amount (PHP)</Label>
                            <Input
                                type='number'
                                step='0.01'
                                name='amount_php'
                                required
                                value={formData.amount_php || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Type of Receipt</Label>
                            <select
                                name='type_of_receipt'
                                value={formData.type_of_receipt}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {RECEIPT_TYPES.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );

            case 'capitalisation':
                return (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label>Date of Receipt</Label>
                            <input
                                type='date'
                                name='date_of_receipt'
                                required
                                value={formData.date_of_receipt || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Month</Label>
                            <select
                                name='month'
                                required
                                value={formData.month || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {MONTHS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Fund By</Label>
                            <Input
                                type='text'
                                name='fund_by'
                                required
                                value={formData.fund_by || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Bank Funded To</Label>
                            <select
                                name='bank_funded'
                                required
                                value={formData.bank_funded || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {PAYMENT_SOURCES.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Amount (PHP)</Label>
                            <Input
                                type='number'
                                step='0.01'
                                name='amount_php'
                                required
                                value={formData.amount_php || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                );

            case 'dividends':
                return (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label>Date of Transaction</Label>
                            <input
                                type='date'
                                name='date_of_transaction'
                                required
                                value={formData.date_of_transaction || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Month</Label>
                            <select
                                name='month'
                                required
                                value={formData.month || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {MONTHS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Paid To</Label>
                            <Input
                                type='text'
                                name='paid_to'
                                required
                                value={formData.paid_to || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Payment Method</Label>
                            <select
                                name='payment_method'
                                required
                                value={formData.payment_method || ''}
                                onChange={handleChange}
                                className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {PAYMENT_SOURCES.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Amount (PHP)</Label>
                            <Input
                                type='number'
                                step='0.01'
                                name='amount_php'
                                required
                                value={formData.amount_php || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                );

            default:
                return <p>Unknown expense type.</p>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-w-2xl bg-white max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='text-xl font-bold text-[#1B4D5C]'>
                        Edit Expense
                    </DialogTitle>
                    <p className='text-sm text-gray-500 font-mono'>
                        Code: {expense.internal_code}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-6 mt-4'>
                    {renderFormFields()}

                    <div className='space-y-2'>
                        <Label>Notes</Label>
                        <Textarea
                            name='notes'
                            rows={3}
                            value={formData.notes || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <DialogFooter className='pt-4 border-t'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='bg-[#1B4D5C] hover:bg-[#11313A]'
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseEditModal;
