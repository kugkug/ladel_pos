import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CompanyContext } from '@/contexts/CompanyContext';
import { useToast } from '@/components/ui/use-toast';
import {
    Building2,
    ArrowLeft,
    Edit,
    Trash2,
    UserPlus,
    Mail,
    Phone,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import CompanyFormModal from '@/components/CompanyFormModal';
import AddContactModal from '@/components/AddContactModal';
import EditContactModal from '@/components/EditContactModal';
import DeleteContactConfirmation from '@/components/DeleteContactConfirmation';

const CompanyDetailsPage = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const {
        getCompanyById,
        getCompanyContacts,
        deleteCompany,
        setPrimaryContact,
        deleteContact
    } = useContext(CompanyContext);

    const [company, setCompany] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);

    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [isEditContactOpen, setIsEditContactOpen] = useState(false);
    const [isDeleteContactOpen, setIsDeleteContactOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const companyData = await getCompanyById(companyId);
            setCompany(companyData);
            const contactsData = await getCompanyContacts(companyId);
            setContacts(contactsData);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Could not load company details.',
                variant: 'destructive'
            });
            navigate('/sales/companies');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (companyId) {
            loadData();
        }
    }, [companyId]);

    const handleDeleteCompany = async () => {
        if (
            window.confirm(
                `Are you sure you want to permanently delete ${company.company_name} and all its contacts?`
            )
        ) {
            try {
                await deleteCompany(company.id);
                toast({
                    title: 'Success',
                    description: 'Company deleted successfully.'
                });
                navigate('/sales/companies');
            } catch (err) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete company.',
                    variant: 'destructive'
                });
            }
        }
    };

    const handleTogglePrimary = async (contactId, isCurrentlyPrimary) => {
        if (isCurrentlyPrimary) return; // Only toggle non-primary to primary
        try {
            await setPrimaryContact(contactId, companyId);
            toast({
                title: 'Success',
                description: 'Primary contact updated.'
            });
            loadData();
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update primary contact.',
                variant: 'destructive'
            });
        }
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-96'>
                <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
            </div>
        );
    }

    if (!company) return null;

    return (
        <>
            <Helmet>
                <title>{company.company_name} - APEX</title>
            </Helmet>
            <div className='max-w-[1200px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300'>
                {/* Top Navigation */}
                <div>
                    <button
                        onClick={() => navigate('/sales/companies')}
                        className='flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4'
                    >
                        <ArrowLeft className='w-4 h-4' /> Back to Companies
                    </button>
                </div>

                {/* Company Header Card */}
                <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden'>
                    <div className='absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none'></div>

                    <div className='flex flex-col md:flex-row justify-between items-start md:items-start gap-4 relative z-10'>
                        <div className='flex items-start gap-4'>
                            <div className='bg-[#1B4D5C] p-3 rounded-xl shadow-md shrink-0'>
                                <Building2 className='w-8 h-8 text-white' />
                            </div>
                            <div>
                                <div className='flex items-center gap-3 flex-wrap'>
                                    <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                                        {company.company_name}
                                    </h1>
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${company.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        {company.status || 'Active'}
                                    </span>
                                </div>
                                <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700'>
                                    {company.company_tin && (
                                        <p>
                                            <span className='font-semibold text-gray-900'>
                                                TIN:
                                            </span>{' '}
                                            {company.company_tin}
                                        </p>
                                    )}
                                    {company.company_address && (
                                        <p>
                                            <span className='font-semibold text-gray-900'>
                                                Address:
                                            </span>{' '}
                                            {company.company_address}
                                        </p>
                                    )}
                                    {company.notes && (
                                        <p className='col-span-1 sm:col-span-2 mt-2'>
                                            <span className='font-semibold text-gray-900'>
                                                Notes:
                                            </span>{' '}
                                            {company.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 shrink-0 self-end md:self-auto w-full md:w-auto justify-end mt-4 md:mt-0'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setIsEditCompanyOpen(true)}
                                className='border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                            >
                                <Edit className='w-4 h-4 mr-2' /> Edit Info
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleDeleteCompany}
                                className='border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700'
                            >
                                <Trash2 className='w-4 h-4 mr-2' /> Delete
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Contacts Section */}
                <div className='space-y-4 pt-4'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                            <span className='w-1.5 h-6 bg-[#FF6B35] rounded-full inline-block'></span>{' '}
                            Contact Persons
                        </h2>
                        {contacts.length > 0 && (
                            <Button
                                onClick={() => setIsAddContactOpen(true)}
                                className='bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            >
                                <UserPlus className='w-4 h-4 mr-2' /> Add
                                Contact
                            </Button>
                        )}
                    </div>

                    {contacts.length === 0 ? (
                        <div className='contact-empty-state flex flex-col items-center justify-center text-center'>
                            <div className='bg-white p-4 rounded-full mb-4 shadow-sm text-blue-500 border border-blue-100'>
                                <UserPlus className='w-10 h-10' />
                            </div>
                            <h3 className='text-lg font-bold text-gray-900 mb-1'>
                                No contact persons added yet
                            </h3>
                            <p className='text-gray-500 text-sm mb-6 max-w-md'>
                                Add a contact person to streamline your
                                communications and project management for this
                                company.
                            </p>
                            <Button
                                onClick={() => setIsAddContactOpen(true)}
                                className='bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-5 rounded-xl'
                            >
                                <UserPlus className='w-5 h-5 mr-2' /> Add
                                Contact Person
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className='hidden md:block border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white'>
                                <table className='contact-table'>
                                    <thead className='contact-table-header'>
                                        <tr>
                                            <th className='p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                                Contact Name
                                            </th>
                                            <th className='p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                                Email
                                            </th>
                                            <th className='p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                                Phone
                                            </th>
                                            <th className='p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                                Role
                                            </th>
                                            <th className='p-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                                Primary
                                            </th>
                                            <th className='p-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contacts.map((contact) => (
                                            <tr
                                                key={contact.id}
                                                className={`contact-table-row ${contact.is_primary ? 'contact-primary-row' : ''}`}
                                            >
                                                <td className='p-4 font-bold text-gray-900'>
                                                    {contact.contact_name}
                                                </td>
                                                <td className='p-4 text-gray-600'>
                                                    {contact.contact_email ||
                                                        '-'}
                                                </td>
                                                <td className='p-4 text-gray-600'>
                                                    {contact.contact_phone ||
                                                        '-'}
                                                </td>
                                                <td className='p-4 text-gray-600'>
                                                    {contact.role_title || '-'}
                                                </td>
                                                <td className='p-4 text-center'>
                                                    <div className='flex justify-center items-center gap-2'>
                                                        <Switch
                                                            checked={
                                                                contact.is_primary
                                                            }
                                                            onCheckedChange={() =>
                                                                handleTogglePrimary(
                                                                    contact.id,
                                                                    contact.is_primary
                                                                )
                                                            }
                                                            disabled={
                                                                contact.is_primary
                                                            }
                                                        />
                                                        {contact.is_primary && (
                                                            <ShieldCheck className='w-4 h-4 text-blue-600' />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className='p-4 text-right'>
                                                    <div className='flex justify-end gap-2'>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-blue-600 hover:bg-blue-50'
                                                            onClick={() => {
                                                                setSelectedContact(
                                                                    contact
                                                                );
                                                                setIsEditContactOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            <Edit className='w-4 h-4' />
                                                        </Button>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-red-600 hover:bg-red-50'
                                                            onClick={() => {
                                                                setSelectedContact(
                                                                    contact
                                                                );
                                                                setIsDeleteContactOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className='w-4 h-4' />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className='grid grid-cols-1 gap-4 md:hidden'>
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className={`bg-white border ${contact.is_primary ? 'border-blue-300 shadow-md' : 'border-gray-200'} rounded-xl p-4 space-y-3 relative`}
                                    >
                                        {contact.is_primary && (
                                            <div className='absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 uppercase tracking-wider'>
                                                <ShieldCheck className='w-3 h-3' />{' '}
                                                Primary
                                            </div>
                                        )}
                                        <div>
                                            <p className='font-bold text-lg text-gray-900'>
                                                {contact.contact_name}
                                            </p>
                                            {contact.role_title && (
                                                <p className='text-sm text-gray-500 font-medium'>
                                                    {contact.role_title}
                                                </p>
                                            )}
                                        </div>
                                        <div className='space-y-1.5 text-sm text-gray-700'>
                                            {contact.contact_email && (
                                                <p className='flex items-center gap-2'>
                                                    <Mail className='w-4 h-4 text-gray-400' />{' '}
                                                    {contact.contact_email}
                                                </p>
                                            )}
                                            {contact.contact_phone && (
                                                <p className='flex items-center gap-2'>
                                                    <Phone className='w-4 h-4 text-gray-400' />{' '}
                                                    {contact.contact_phone}
                                                </p>
                                            )}
                                        </div>

                                        <div className='flex items-center justify-between pt-3 border-t border-gray-100 mt-2'>
                                            <div className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                                                <Switch
                                                    checked={contact.is_primary}
                                                    onCheckedChange={() =>
                                                        handleTogglePrimary(
                                                            contact.id,
                                                            contact.is_primary
                                                        )
                                                    }
                                                    disabled={
                                                        contact.is_primary
                                                    }
                                                />
                                                Primary
                                            </div>
                                            <div className='flex gap-2'>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    className='h-8 border-gray-200 text-blue-600 bg-white'
                                                    onClick={() => {
                                                        setSelectedContact(
                                                            contact
                                                        );
                                                        setIsEditContactOpen(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    <Edit className='w-3.5 h-3.5 mr-1' />{' '}
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    className='h-8 border-gray-200 text-red-600 bg-white'
                                                    onClick={() => {
                                                        setSelectedContact(
                                                            contact
                                                        );
                                                        setIsDeleteContactOpen(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className='w-3.5 h-3.5 mr-1' />{' '}
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <CompanyFormModal
                isOpen={isEditCompanyOpen}
                onClose={() => setIsEditCompanyOpen(false)}
                initialData={company}
                onSuccess={loadData}
            />

            <AddContactModal
                companyId={company.id}
                isOpen={isAddContactOpen}
                onClose={() => setIsAddContactOpen(false)}
                onSaveSuccess={loadData}
            />

            <EditContactModal
                contact={selectedContact}
                companyId={company.id}
                isOpen={isEditContactOpen}
                onClose={() => {
                    setIsEditContactOpen(false);
                    setSelectedContact(null);
                }}
                onSaveSuccess={loadData}
            />

            <DeleteContactConfirmation
                contact={selectedContact}
                companyId={company.id}
                isOpen={isDeleteContactOpen}
                onClose={() => {
                    setIsDeleteContactOpen(false);
                    setSelectedContact(null);
                }}
                onConfirm={async (id) => {
                    await deleteContact(id);
                    loadData();
                }}
            />
        </>
    );
};

export default CompanyDetailsPage;
