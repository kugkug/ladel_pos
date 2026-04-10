import React, { useState, useEffect, useContext } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CompanyContext } from '@/contexts/CompanyContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const CompanyFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
    const { addCompany, addContact, editCompany } = useContext(CompanyContext);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        company_name: '',
        company_tin: '',
        company_address: '',
        status: 'Active',
        notes: '',
        // First contact fields (only used when adding a new company)
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        role_title: '',
        is_primary: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                company_name: initialData.company_name || '',
                company_tin: initialData.company_tin || '',
                company_address: initialData.company_address || '',
                status: initialData.status || 'Active',
                notes: initialData.notes || '',
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                role_title: '',
                is_primary: true
            });
        } else {
            setFormData({
                company_name: '',
                company_tin: '',
                company_address: '',
                status: 'Active',
                notes: '',
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                role_title: '',
                is_primary: true
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.company_name.trim()) {
            setError('Company name is required');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            let result;
            if (initialData?.id) {
                const companyData = {
                    company_name: formData.company_name,
                    company_tin: formData.company_tin,
                    company_address: formData.company_address,
                    status: formData.status,
                    notes: formData.notes
                };
                result = await editCompany(initialData.id, companyData);
                toast({
                    title: 'Success',
                    description: 'Company updated successfully'
                });
            } else {
                const companyData = {
                    company_name: formData.company_name,
                    company_tin: formData.company_tin,
                    company_address: formData.company_address,
                    status: formData.status,
                    notes: formData.notes
                };
                const contactData = {
                    contact_name: formData.contact_name,
                    contact_email: formData.contact_email,
                    contact_phone: formData.contact_phone,
                    role_title: formData.role_title,
                    is_primary: formData.is_primary
                };

                if (!contactData.contact_name.trim()) {
                    setError('Contact name is required');
                    return;
                }
                if (
                    contactData.contact_email &&
                    !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
                        contactData.contact_email
                    )
                ) {
                    setError('Invalid email format');
                    return;
                }

                // Create company + its first contact in one flow.
                const createdCompany = await addCompany(companyData);
                await addContact(createdCompany.id, contactData);
                // Toast/navigation logic for new creation is handled by the parent.
                result = createdCompany;
            }
            if (onSuccess) onSuccess(result);
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={`${!initialData ? 'max-w-4xl' : 'max-w-md'} bg-white p-0 overflow-hidden`}
            >
                <DialogHeader className='p-6 bg-gray-50 border-b border-gray-100'>
                    <DialogTitle className='text-xl font-bold text-gray-900'>
                        {initialData ? 'Edit Company' : 'Add New Company'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                    {error && (
                        <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2'>
                            <AlertCircle className='w-4 h-4' /> {error}
                        </div>
                    )}

                    <div className='flex gap-4'>
                        <div className='flex-1'>
                            <div className='space-y-3 pb-2'>
                                <Label>
                                    Company Name{' '}
                                    <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    value={formData.company_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            company_name: e.target.value
                                        })
                                    }
                                    placeholder='e.g. Acme Corp'
                                    autoFocus
                                />
                            </div>

                            <div className='space-y-3 pb-2'>
                                <Label>TIN (Optional)</Label>
                                <Input
                                    value={formData.company_tin}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            company_tin: e.target.value
                                        })
                                    }
                                    placeholder='000-000-000-000'
                                />
                            </div>

                            <div className='space-y-1.5 pb-2'>
                                <Label>Address (Optional)</Label>
                                <Textarea
                                    value={formData.company_address}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            company_address: e.target.value
                                        })
                                    }
                                    placeholder='Full office address'
                                    className='resize-none'
                                />
                            </div>

                            <div className='space-y-1.5 pb-2'>
                                <Label>Status</Label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value
                                        })
                                    }
                                    className='flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                                >
                                    <option value='Active'>Active</option>
                                    <option value='Inactive'>Inactive</option>
                                </select>
                            </div>

                            <div className='space-y-1.5 pb-2'>
                                <Label>Notes (Optional)</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value
                                        })
                                    }
                                    placeholder='Any internal notes'
                                    className='resize-none h-20'
                                />
                            </div>
                            {initialData?.updated_at && (
                                <p className='text-xs text-gray-400 text-center pt-2'>
                                    Last updated:{' '}
                                    {format(
                                        new Date(initialData.updated_at),
                                        'MMM d, yyyy h:mm a'
                                    )}
                                </p>
                            )}
                        </div>

                        {!(initialData && initialData.id) && (
                            <div className='flex-1'>
                                <div className='space-y-3 pb-2'>
                                    <Label>
                                        Contact Name{' '}
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        value={formData.contact_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                contact_name: e.target.value
                                            })
                                        }
                                        placeholder='e.g. Jane Doe'
                                    />
                                </div>

                                <div className='space-y-3 pb-2'>
                                    <Label>Email Address</Label>
                                    <Input
                                        type='email'
                                        value={formData.contact_email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                contact_email: e.target.value
                                            })
                                        }
                                        placeholder='jane@company.com'
                                    />
                                </div>

                                <div className='space-y-3 pb-2'>
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={formData.contact_phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                contact_phone: e.target.value
                                            })
                                        }
                                        maxLength={20}
                                        placeholder='+63 900 000 0000'
                                    />
                                </div>

                                <div className='space-y-3 pb-2'>
                                    <Label>Role / Title</Label>
                                    <Input
                                        value={formData.role_title}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                role_title: e.target.value
                                            })
                                        }
                                        maxLength={100}
                                        placeholder='e.g. Purchasing Manager'
                                    />
                                </div>

                                <div className='flex items-start space-x-2 pt-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100'>
                                    <Checkbox
                                        id='is_primary_add_company'
                                        checked={formData.is_primary}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                is_primary: checked
                                            })
                                        }
                                    />
                                    <div className='grid gap-1.5 leading-none'>
                                        <label
                                            htmlFor='is_primary_add_company'
                                            className='text-sm font-bold text-blue-900 cursor-pointer'
                                        >
                                            Set as Primary Contact
                                        </label>
                                        <p className='text-xs text-blue-700'>
                                            First contact is automatically set
                                            as primary.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
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
                            className='bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]'
                        >
                            {isSubmitting ? (
                                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                            ) : null}
                            {initialData ? 'Update' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CompanyFormModal;
