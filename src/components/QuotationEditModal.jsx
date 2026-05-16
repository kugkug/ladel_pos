import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { logUpdate } from '@/lib/ActivityLogger';
import { useAuth } from '@/contexts/AuthContext';
import { validateQuotation } from '@/lib/quotationValidation';
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext';
import { updateQuotation } from '@/lib/quotationService';

const calculateTaxAmount = (amount, taxType) => {
    if (!amount) return 0;
    return taxType === 'VAT (12%)' ? amount * 0.12 : 0;
};

const calculateGrossAmount = (amount, taxType) => {
    if (!amount) return 0;
    return amount + calculateTaxAmount(amount, taxType);
};

const getVatPercentage = (taxType) => (taxType === 'VAT (12%)' ? 0.12 : 0);

const normalizeTaxType = (taxType) => {
    if (taxType === 'VAT Exempt') return 'VAT Exempted';
    return taxType || 'VAT (12%)';
};

const QuotationEditModal = ({
    isOpen,
    onClose,
    data,
    onSaveSuccess,
    onPromptPO
}) => {
    const { toast } = useToast();
    const { currentUser } = useAuth();
    const { triggerRefresh } = useDashboardRefresh();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const [formData, setFormData] = useState({
        quotation_number: '',
        date_issued: '',
        quotation_status: 'Pending',
        order_description: '',
        net_amount: '',
        tax_type: 'VAT (12%)'
    });

    useEffect(() => {
        if (data && isOpen) {
            setFormData({
                quotation_number: data.quotation_number || '',
                date_issued: data.date_issued || '',
                quotation_status: data.quotation_status || 'Pending',
                order_description: data.order_description || '',
                net_amount: data.net_amount || '',
                tax_type: 'VAT (12%)'
            });
            setFormErrors({});
            setHasAttemptedSubmit(false);
        }
    }, [data, isOpen]);

    // Display-only calculations based on current inputs
    const amount = formData.net_amount ? parseFloat(formData.net_amount) : 0;
    const vatAmount = calculateTaxAmount(amount, formData.tax_type);
    const totalAmount = calculateGrossAmount(amount, formData.tax_type);

    const clearError = (field) => {
        if (formErrors[field]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);

        const errors = validateQuotation({
            quotation_number: formData.quotation_number,
            status: formData.quotation_status
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors({
                quotation_number: errors.quotation_number,
                quotation_status: errors.status
            });
            setTimeout(() => {
                const errEl = document.querySelector('.border-red-500');
                if (errEl)
                    errEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
            }, 100);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                quotation_number: formData.quotation_number,
                quotation_status: formData.quotation_status,
                date_issued: formData.date_issued || null,
                order_description: formData.order_description || null,
                net_amount: amount,
                tax_type: formData.tax_type,
                vat_percentage: getVatPercentage(formData.tax_type),
                vat_amount: vatAmount
            };
            console.log(payload);
            // Use the new quotationService logic
            const updatedRecord = await updateQuotation(data.id, payload);

            if (currentUser)
                logUpdate(
                    currentUser,
                    'SALES',
                    'QUOTATION',
                    data.quotation_number,
                    data,
                    payload
                );
            toast({
                title: 'Success',
                description: 'Quotation updated successfully'
            });

            triggerRefresh('quotation-changed');

            onSaveSuccess();
            onClose();

            if (
                data.quotation_status !== 'Confirmed' &&
                formData.quotation_status === 'Confirmed' &&
                onPromptPO
            ) {
                onPromptPO(updatedRecord); // Pass updated quotation with calculated fields
            }
        } catch (err) {
            console.error('Quotation update failed:', err);
            toast({
                title: 'Error Updating Quotation',
                description: err.message,
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInputClass = (fieldName) =>
        formErrors[fieldName] && hasAttemptedSubmit
            ? 'mt-1 border-red-500 focus-visible:ring-red-500 bg-red-50/10'
            : 'mt-1';

    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='w-[min(900px,96vw)] max-w-none h-[90vh] flex flex-col bg-white p-0 overflow-hidden'>
                <DialogHeader className='px-6 py-4 border-b sticky top-0 bg-white z-10'>
                    <DialogTitle>Edit Quotation</DialogTitle>
                </DialogHeader>

                <div className='p-6 overflow-y-auto flex-1'>
                    <form
                        id='editQuotationForm'
                        onSubmit={handleSubmit}
                        className='space-y-6'
                    >
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <div>
                                <Label>
                                    Quotation Number{' '}
                                    <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    value={formData.quotation_number}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            quotation_number: e.target.value
                                        });
                                        clearError('quotation_number');
                                    }}
                                    className={getInputClass(
                                        'quotation_number'
                                    )}
                                />
                                {formErrors.quotation_number &&
                                    hasAttemptedSubmit && (
                                        <p className='text-xs text-red-500 mt-1 font-medium'>
                                            {formErrors.quotation_number}
                                        </p>
                                    )}
                            </div>
                            <div>
                                <Label>Date Issued</Label>
                                <Input
                                    type='date'
                                    value={formData.date_issued}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            date_issued: e.target.value
                                        })
                                    }
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <Label>
                                    Status{' '}
                                    <span className='text-red-500'>*</span>
                                </Label>
                                <select
                                    value={formData.quotation_status}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            quotation_status: e.target.value
                                        });
                                        clearError('quotation_status');
                                    }}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 ${formErrors.quotation_status && hasAttemptedSubmit ? 'border-red-500 bg-red-50/10' : ''}`}
                                >
                                    <option value='' disabled>
                                        Select Status
                                    </option>
                                    <option value='Pending'>Pending</option>
                                    <option value='Confirmed'>Confirmed</option>
                                    <option value='Canceled'>Canceled</option>
                                </select>
                                {formErrors.quotation_status &&
                                    hasAttemptedSubmit && (
                                        <p className='text-xs text-red-500 mt-1 font-medium'>
                                            {formErrors.quotation_status}
                                        </p>
                                    )}
                            </div>
                        </div>

                        <div>
                            <Label>Order Description</Label>
                            <Textarea
                                placeholder='Enter order description (optional)'
                                value={formData.order_description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        order_description: e.target.value
                                    })
                                }
                                className='mt-1 min-h-[120px]'
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>
                                <Label>Amount (before tax)</Label>
                                <Input
                                    type='number'
                                    step='0.01'
                                    min='0'
                                    placeholder='Enter amount (optional)'
                                    value={formData.net_amount}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            net_amount: e.target.value
                                        })
                                    }
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <Label>Tax Type</Label>
                                <select
                                    value={formData.tax_type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tax_type: e.target.value
                                        })
                                    }
                                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1'
                                >
                                    <option value='VAT (12%)'>VAT (12%)</option>
                                    <option value='VAT Exempted'>
                                        VAT Exempted
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className='bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm text-sm'>
                            <div className='flex justify-between text-gray-600 mb-2'>
                                <span>VAT Amount (Calculated):</span>{' '}
                                <span>{formatCurrency(vatAmount)}</span>
                            </div>
                            <div className='flex justify-between font-bold text-lg text-blue-800 pt-2 border-t border-blue-200'>
                                <span>Total Amount (Calculated):</span>{' '}
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </form>
                </div>

                <div className='px-6 py-4 border-t sticky bottom-0 bg-white z-10 flex justify-end gap-3'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onClose}
                        className='min-h-[44px] px-6'
                    >
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        form='editQuotationForm'
                        disabled={isSubmitting}
                        className='bg-blue-600 text-white min-h-[44px] px-6'
                    >
                        {isSubmitting && (
                            <Loader2 className='animate-spin w-4 h-4 mr-2' />
                        )}{' '}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
export default QuotationEditModal;
