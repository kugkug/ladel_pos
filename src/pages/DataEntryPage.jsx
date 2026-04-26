import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ProjectContext } from '@/contexts/ProjectContext';
import { CompanyContext } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Search,
    Plus,
    CheckCircle2,
    AlertCircle,
    Building2,
    User,
    Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import CompanyFormModal from '@/components/CompanyFormModal';
import { validateQuotation } from '@/lib/quotationValidation';

const calculateTaxAmount = (amount, taxType) => {
    if (!amount) return 0;
    return taxType === 'VAT (12%)' ? amount * 0.12 : 0;
};

const calculateGrossAmount = (amount, taxType) => {
    if (!amount) return 0;
    return amount + calculateTaxAmount(amount, taxType);
};

const validateProjectData = (projectData, companyId) => {
    const errors = {};
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!companyId || !uuidRegex.test(companyId)) {
        errors.company = 'Please select a Company';
    }

    // Note: contactId validation removed to make the field optional

    if (!projectData.pr_number?.trim()) {
        errors.pr_number = 'PR Number is required';
    }
    if (!projectData.projectTitle?.trim()) {
        errors.projectTitle = 'Project Title is required';
    }

    return errors;
};

const checkProjectNumberExists = async (prNumber) => {
    if (!prNumber) return false;
    try {
        const { data } = await supabase
            .from('projects')
            .select('id')
            .eq('project_number', prNumber.trim())
            .maybeSingle();
        return !!data;
    } catch (err) {
        console.error('Error checking PR number:', err);
        return false;
    }
};

const DataEntryPage = () => {
    const { createProject } = useContext(ProjectContext);
    const { companies, getCompanyContacts } = useContext(CompanyContext);
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const [projectData, setProjectData] = useState({
        pr_number: '',
        projectTitle: ''
    });

    const [companySearchQuery, setCompanySearchQuery] = useState('');
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [companyContacts, setCompanyContacts] = useState([]);
    const [selectedContactId, setSelectedContactId] = useState('');

    const [quotationData, setQuotationData] = useState({
        quotationNumber: '',
        dateIssued: new Date().toISOString().split('T')[0],
        quotationStatus: 'Pending',
        orderDescription: '',
        net_amount: '',
        taxType: 'VAT (12%)'
    });

    const amount = quotationData.net_amount
        ? parseFloat(quotationData.net_amount)
        : 0;
    const vatAmount = calculateTaxAmount(amount, quotationData.taxType);
    const totalAmount = calculateGrossAmount(amount, quotationData.taxType);

    const clearError = (field) => {
        if (formErrors[field]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleCompanySelect = async (company) => {
        setSelectedCompany(company);
        setCompanySearchQuery(company.company_name);
        setIsCompanyDropdownOpen(false);
        clearError('company');

        try {
            const contacts = await getCompanyContacts(company.id);
            setCompanyContacts(contacts);
            if (contacts.length > 0) {
                const primary =
                    contacts.find((c) => c.is_primary) || contacts[0];
                setSelectedContactId(primary.id);
            } else {
                setSelectedContactId('');
            }
        } catch (err) {
            console.error('Error loading company contacts:', err);
        }
    };

    const handleSaveClick = async (e) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);
        setGlobalError('');

        const pErrors = validateProjectData(projectData, selectedCompany?.id);
        const qErrors = validateQuotation({
            quotation_number: quotationData.quotationNumber,
            status: quotationData.quotationStatus
        });

        const errors = { ...pErrors };
        if (qErrors.quotation_number)
            errors.quotationNumber = qErrors.quotation_number;
        if (qErrors.status) errors.quotationStatus = qErrors.status;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast({
                title: 'Validation Error',
                description: 'Please fix the highlighted fields.',
                variant: 'destructive'
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
            const isDuplicate = await checkProjectNumberExists(
                projectData.pr_number
            );
            if (isDuplicate) {
                setFormErrors((prev) => ({
                    ...prev,
                    pr_number: 'PR number already exists'
                }));
                setIsSubmitting(false);
                return;
            }

            const projPayload = {
                pr_number: projectData.pr_number,
                projectTitle: projectData.projectTitle,
                companyId: selectedCompany.id,
                contactId: selectedContactId || null // Ensure null if empty
            };

            const qtPayload = {
                quotationNumber: quotationData.quotationNumber,
                quotationStatus: quotationData.quotationStatus,
                net_amount: amount,
                taxType: quotationData.taxType
            };
            console.log(qtPayload);
            if (quotationData.dateIssued)
                qtPayload.dateIssued = quotationData.dateIssued;
            if (quotationData.orderDescription)
                qtPayload.orderDescription = quotationData.orderDescription;

            const newProject = await createProject(projPayload, qtPayload);

            toast({
                title: 'Success!',
                description: `Project ${newProject.project_number} and Quotation successfully created.`
            });
            navigate('/sales/projects');
        } catch (err) {
            console.error('Submission failed with error:', err);
            setGlobalError(
                err.message ||
                    'An unexpected error occurred while saving the project.'
            );
            toast({
                title: 'Save Failed',
                description: err.message || 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCompanies = companies.filter((c) =>
        c.company_name.toLowerCase().includes(companySearchQuery.toLowerCase())
    );
    const getInputClass = (fieldName) =>
        formErrors[fieldName] && hasAttemptedSubmit
            ? 'mt-1 border-red-500 focus-visible:ring-red-500 bg-red-50/10'
            : 'mt-1';

    return (
        <>
            <Helmet>
                <title>Data Entry - Pipeline</title>
            </Helmet>
            <div className='max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-300'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        New Project Entry
                    </h1>
                    <p className='text-gray-500 mt-1'>
                        Create a project and generate its initial quotation
                    </p>
                </div>

                {globalError && (
                    <div className='mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-bold flex items-center gap-2'>
                        <AlertCircle className='w-5 h-5' /> {globalError}
                    </div>
                )}

                <form className='space-y-8' onSubmit={handleSaveClick}>
                    <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm'>
                        <h3 className='text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2'>
                            <span className='w-2 h-6 bg-blue-600 rounded-full'></span>
                            Project Information
                        </h3>

                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <Label>
                                        PR Number{' '}
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        value={projectData.pr_number}
                                        onChange={(e) => {
                                            setProjectData({
                                                ...projectData,
                                                pr_number: e.target.value
                                            });
                                            clearError('pr_number');
                                        }}
                                        placeholder='Enter PR number'
                                        className={getInputClass('pr_number')}
                                    />
                                    {formErrors.pr_number &&
                                        hasAttemptedSubmit && (
                                            <p className='text-xs text-red-500 mt-1 font-medium'>
                                                {formErrors.pr_number}
                                            </p>
                                        )}
                                </div>
                                <div>
                                    <Label>
                                        Project Title{' '}
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input
                                        value={projectData.projectTitle}
                                        onChange={(e) => {
                                            setProjectData({
                                                ...projectData,
                                                projectTitle: e.target.value
                                            });
                                            clearError('projectTitle');
                                        }}
                                        placeholder='Enter project title'
                                        className={getInputClass(
                                            'projectTitle'
                                        )}
                                    />
                                    {formErrors.projectTitle &&
                                        hasAttemptedSubmit && (
                                            <p className='text-xs text-red-500 mt-1 font-medium'>
                                                {formErrors.projectTitle}
                                            </p>
                                        )}
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <Label>
                                        Select Client / Company{' '}
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='relative mt-1'>
                                        <Search className='absolute left-3 top-2.5 w-4 h-4 text-gray-400' />
                                        <input
                                            type='text'
                                            placeholder='Search existing company...'
                                            value={companySearchQuery}
                                            onChange={(e) => {
                                                setCompanySearchQuery(
                                                    e.target.value
                                                );
                                                setIsCompanyDropdownOpen(true);
                                                clearError('company');
                                                if (
                                                    selectedCompany &&
                                                    e.target.value !==
                                                        selectedCompany.company_name
                                                ) {
                                                    setSelectedCompany(null);
                                                    setCompanyContacts([]);
                                                }
                                            }}
                                            onFocus={() =>
                                                setIsCompanyDropdownOpen(true)
                                            }
                                            className={`w-full pl-9 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${formErrors.company && hasAttemptedSubmit ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : 'border-gray-200 focus:ring-blue-500'}`}
                                        />
                                    </div>
                                    {formErrors.company &&
                                        hasAttemptedSubmit && (
                                            <p className='text-sm font-medium text-red-600 mt-1'>
                                                {formErrors.company}
                                            </p>
                                        )}
                                    {isCompanyDropdownOpen &&
                                        companySearchQuery &&
                                        !selectedCompany && (
                                            <div className=' relative z-20 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto'>
                                                {filteredCompanies.length >
                                                0 ? (
                                                    filteredCompanies.map(
                                                        (c) => (
                                                            <div
                                                                key={c.id}
                                                                onClick={() =>
                                                                    handleCompanySelect(
                                                                        c
                                                                    )
                                                                }
                                                                className='p-3 hover:bg-gray-50 cursor-pointer border-b flex items-center gap-2'
                                                            >
                                                                <Building2 className='w-4 h-4 text-gray-400' />
                                                                <p className='font-bold text-gray-900'>
                                                                    {
                                                                        c.company_name
                                                                    }
                                                                </p>
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <div className='p-4 text-center'>
                                                        <Button
                                                            type='button'
                                                            size='sm'
                                                            onClick={() =>
                                                                setShowCompanyForm(
                                                                    true
                                                                )
                                                            }
                                                            className='bg-blue-600 hover:bg-blue-700 text-white'
                                                        >
                                                            <Plus className='w-4 h-4 mr-1' />{' '}
                                                            Add New Company
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    {selectedCompany && (
                                        <div className='mt-3 bg-green-50 p-3 rounded-xl border border-green-200 flex items-start gap-2'>
                                            <CheckCircle2 className='w-4 h-4 text-green-600 shrink-0 mt-0.5' />
                                            <div className='flex-1'>
                                                <p className='font-bold text-sm text-green-900'>
                                                    {
                                                        selectedCompany.company_name
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {!selectedCompany && (
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                                setShowCompanyForm(true)
                                            }
                                            className='w-full mt-3 border-dashed'
                                        >
                                            <Plus className='w-4 h-4 mr-1' />{' '}
                                            Create New Company Record
                                        </Button>
                                    )}
                                </div>

                                <div>
                                    <Label>Attention To (Contact)</Label>
                                    <div className='relative mt-1'>
                                        <User className='absolute left-3 top-2.5 w-4 h-4 text-gray-400 z-10' />
                                        <select
                                            value={selectedContactId}
                                            onChange={(e) => {
                                                setSelectedContactId(
                                                    e.target.value
                                                );
                                            }}
                                            disabled={
                                                !selectedCompany ||
                                                companyContacts.length === 0
                                            }
                                            className={`w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 border-gray-200 ${!selectedCompany || companyContacts.length === 0 ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                                        >
                                            <option value=''>
                                                Select a contact (optional)...
                                            </option>
                                            {companyContacts.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.contact_name}{' '}
                                                    {c.is_primary
                                                        ? '(Primary)'
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedCompany &&
                                        companyContacts.length === 0 && (
                                            <p className='text-xs text-amber-600 italic mt-2'>
                                                No contacts found for this
                                                company.
                                            </p>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2'>
                            <span className='w-2 h-6 bg-blue-600 rounded-full'></span>
                            Initial Quotation Details
                        </h3>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div>
                                <Label>
                                    Quotation Number{' '}
                                    <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    value={quotationData.quotationNumber}
                                    onChange={(e) => {
                                        setQuotationData({
                                            ...quotationData,
                                            quotationNumber: e.target.value
                                        });
                                        clearError('quotationNumber');
                                    }}
                                    placeholder='QT-2024-001'
                                    className={getInputClass('quotationNumber')}
                                />
                                {formErrors.quotationNumber &&
                                    hasAttemptedSubmit && (
                                        <p className='text-xs text-red-500 mt-1 font-medium'>
                                            {formErrors.quotationNumber}
                                        </p>
                                    )}
                            </div>
                            <div>
                                <Label>Date Issued</Label>
                                <Input
                                    type='date'
                                    value={quotationData.dateIssued}
                                    onChange={(e) =>
                                        setQuotationData({
                                            ...quotationData,
                                            dateIssued: e.target.value
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
                                    value={quotationData.quotationStatus}
                                    onChange={(e) => {
                                        setQuotationData({
                                            ...quotationData,
                                            quotationStatus: e.target.value
                                        });
                                        clearError('quotationStatus');
                                    }}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 ${formErrors.quotationStatus && hasAttemptedSubmit ? 'border-red-500 bg-red-50/10' : ''}`}
                                >
                                    <option value='' disabled>
                                        Select Status
                                    </option>
                                    <option value='Pending'>Pending</option>
                                    <option value='Confirmed'>Confirmed</option>
                                    <option value='Cancelled'>Cancelled</option>
                                </select>
                                {formErrors.quotationStatus &&
                                    hasAttemptedSubmit && (
                                        <p className='text-xs text-red-500 mt-1 font-medium'>
                                            {formErrors.quotationStatus}
                                        </p>
                                    )}
                            </div>
                        </div>

                        <div>
                            <Label>Order Description</Label>
                            <Textarea
                                placeholder='Enter order description (optional)'
                                value={quotationData.orderDescription}
                                onChange={(e) =>
                                    setQuotationData({
                                        ...quotationData,
                                        orderDescription: e.target.value
                                    })
                                }
                                className='min-h-[80px] mt-1'
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <Label>Amount (before tax)</Label>
                                <Input
                                    type='number'
                                    step='0.01'
                                    min='0'
                                    placeholder='Enter amount (optional)'
                                    value={quotationData.net_amount}
                                    onChange={(e) =>
                                        setQuotationData({
                                            ...quotationData,
                                            net_amount: e.target.value
                                        })
                                    }
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <Label>Tax Type</Label>
                                <select
                                    value={quotationData.taxType}
                                    onChange={(e) =>
                                        setQuotationData({
                                            ...quotationData,
                                            taxType: e.target.value
                                        })
                                    }
                                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1'
                                >
                                    <option value='VAT (12%)'>VAT (12%)</option>
                                    <option value='VAT Exempt'>
                                        VAT Exempt
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className='bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm text-sm'>
                            <div className='flex justify-between text-gray-600 mb-2'>
                                <span>VAT Amount (Calculated):</span>{' '}
                                <span>{formatCurrency(vatAmount)}</span>
                            </div>
                            <div className='flex justify-between font-bold text-xl text-blue-800 pt-2 border-t border-blue-200'>
                                <span>Total Amount (Calculated):</span>{' '}
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end gap-4 relative z-10'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => navigate('/sales/projects')}
                            className='px-6 py-6 text-base'
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8 py-6 text-lg rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className='animate-spin w-5 h-5 mr-2' />{' '}
                                    Saving...
                                </>
                            ) : (
                                'Save Project & Quotation'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
            <CompanyFormModal
                isOpen={showCompanyForm}
                onClose={() => setShowCompanyForm(false)}
                onSuccess={handleCompanySelect}
            />
        </>
    );
};

export default DataEntryPage;
