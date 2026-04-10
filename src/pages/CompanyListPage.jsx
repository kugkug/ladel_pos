import React, { useContext, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { CompanyContext } from '@/contexts/CompanyContext';
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Building2,
    ArrowUpDown,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CompanyFormModal from '@/components/CompanyFormModal';
import { exportToCSV, generateFilename } from '@/lib/csvExport';

/** Single search box: TIN, company name, address, city, any contact person fields. */
const buildCompanySearchHaystack = (c) => {
    const contacts = c.contacts || [];
    const contactBits = contacts.flatMap((ct) => [
        ct.contact_name,
        ct.contact_email,
        ct.contact_phone,
        ct.role_title
    ]);
    const parts = [
        c.company_name,
        c.company_tin,
        c.company_address,
        c.city,
        c.primary_contact?.contact_name,
        c.primary_contact?.contact_email,
        c.primary_contact?.contact_phone,
        ...contactBits
    ];
    return parts
        .filter((p) => p != null && String(p).trim() !== '')
        .join(' ')
        .toLowerCase();
};

const CompanyListPage = () => {
    const { companies, isLoading, deleteCompany } = useContext(CompanyContext);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({
        key: 'company_name',
        direction: 'asc'
    });

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc')
            direction = 'desc';
        setSortConfig({ key, direction });
    };

    const filteredAndSortedCompanies = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        let filtered = companies.filter((c) => {
            const matchesSearch =
                q === '' || buildCompanySearchHaystack(c).includes(q);
            const matchesStatus =
                statusFilter === 'All' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key] || '';
            let bValue = b[sortConfig.key] || '';

            if (sortConfig.key === 'primary_contact') {
                aValue = a.primary_contact?.contact_name || '';
                bValue = b.primary_contact?.contact_name || '';
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [companies, searchQuery, statusFilter, sortConfig]);

    const handleDelete = async (company) => {
        if (
            window.confirm(
                `Are you sure you want to permanently delete ${company.company_name} and all its contacts?`
            )
        ) {
            await deleteCompany(company.id);
        }
    };

    const openEdit = (company) => {
        setEditingCompany(company);
        setIsFormModalOpen(true);
    };

    const handleCompanySuccess = (result, isNew) => {
        if (isNew && result?.id) {
            toast({
                title: 'Success',
                description:
                    'Company created successfully. Primary contact saved.'
            });
            navigate(`/sales/companies/${result.id}`);
        }
    };

    const handleExportCompanies = () => {
        if (filteredAndSortedCompanies.length === 0) {
            toast({ title: 'Notice', description: 'No companies to export.' });
            return;
        }

        const headers = [
            'Company Name',
            'Company Type',
            'TIN',
            'Address',
            'City',
            'Primary Contact Name',
            'Primary Contact Email',
            'Primary Contact Phone',
            'Status',
            'Date Created'
        ];

        const data = filteredAndSortedCompanies.map((c) => [
            c.company_name || '',
            c.company_type || '', // May be empty depending on schema
            c.company_tin || '',
            c.company_address || '',
            c.city || '', // May be empty
            c.primary_contact?.contact_name || '',
            c.primary_contact?.contact_email || '',
            c.primary_contact?.contact_phone || '',
            c.status || 'Active',
            c.created_at ? new Date(c.created_at).toLocaleDateString() : ''
        ]);

        exportToCSV(data, generateFilename('Companies'), headers);
        toast({
            title: 'Success',
            description: `Exported ${filteredAndSortedCompanies.length} companies successfully.`
        });
    };

    const SortableHeader = ({ label, sortKey }) => (
        <th
            className='px-4 py-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#2C3E50]/80 transition-colors select-none'
            onClick={() => handleSort(sortKey)}
        >
            <div className='flex items-center gap-1'>
                {label}
                <ArrowUpDown
                    className={`w-3 h-3 ${sortConfig.key === sortKey ? 'text-white' : 'text-white/50'}`}
                />
            </div>
        </th>
    );

    return (
        <>
            <Helmet>
                <title>Companies - APEX</title>
            </Helmet>
            <div className='max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300'>
                {/* Header */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex items-center gap-3'>
                        <div className='bg-[#1B4D5C] p-2.5 rounded-xl shadow-md'>
                            <Building2 className='w-6 h-6 text-white' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                Companies
                            </h1>
                            <p className='text-gray-500 mt-1'>
                                Manage client organizations and contacts
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Button
                            onClick={handleExportCompanies}
                            className='bg-blue-600 hover:bg-blue-700 text-white font-bold'
                        >
                            <Download className='w-4 h-4 mr-2' /> Export CSV
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingCompany(null);
                                setIsFormModalOpen(true);
                            }}
                            className='bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-bold'
                        >
                            <Plus className='w-5 h-5 mr-2' /> Add New Company
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4'>
                    <div className='relative w-full md:w-1/3 min-w-[300px]'>
                        <Search className='absolute left-3 top-2.5 w-5 h-5 text-gray-400' />
                        <input
                            type='text'
                            placeholder='Search by TIN, company, address, or contact...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none'
                        />
                    </div>
                    <div className='flex items-center gap-4 text-sm font-medium text-gray-700'>
                        <span>Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className='px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value='All'>All Companies</option>
                            <option value='Active'>Active</option>
                            <option value='Inactive'>Inactive</option>
                        </select>
                        <span className='bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 ml-2'>
                            Total: {filteredAndSortedCompanies.length}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-[#1B4D5C] text-white'>
                                    <SortableHeader
                                        label='Company Name'
                                        sortKey='company_name'
                                    />
                                    <th className='px-4 py-4 text-xs font-semibold uppercase tracking-wider'>
                                        TIN / Address
                                    </th>
                                    <SortableHeader
                                        label='Primary Contact'
                                        sortKey='primary_contact'
                                    />
                                    <SortableHeader
                                        label='Status'
                                        sortKey='status'
                                    />
                                    <th className='px-4 py-4 text-xs font-semibold uppercase tracking-wider text-right'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan='5'
                                            className='text-center py-12'
                                        >
                                            <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto'></div>
                                        </td>
                                    </tr>
                                ) : filteredAndSortedCompanies.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan='5'
                                            className='text-center py-16 text-gray-500 font-medium'
                                        >
                                            No companies found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedCompanies.map((c) => (
                                        <tr
                                            key={c.id}
                                            className='hover:bg-blue-50/30 transition-colors group'
                                        >
                                            <td
                                                className='px-4 py-4 align-top cursor-pointer'
                                                onClick={() =>
                                                    navigate(
                                                        `/sales/companies/${c.id}`
                                                    )
                                                }
                                            >
                                                <p className='font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors'>
                                                    {c.company_name}
                                                </p>
                                                <p className='text-xs text-gray-400 mt-1 line-clamp-1'>
                                                    {c.notes || 'No notes'}
                                                </p>
                                            </td>
                                            <td className='px-4 py-4 align-top'>
                                                <p className='text-sm font-medium text-gray-800'>
                                                    {c.company_tin || '-'}
                                                </p>
                                                <p className='text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-xs'>
                                                    {c.company_address}
                                                </p>
                                            </td>
                                            <td className='px-4 py-4 align-top'>
                                                {c.primary_contact ? (
                                                    <>
                                                        <p className='text-sm font-bold text-gray-900'>
                                                            {
                                                                c
                                                                    .primary_contact
                                                                    .contact_name
                                                            }
                                                        </p>
                                                        <p className='text-xs text-gray-600'>
                                                            {c.primary_contact
                                                                .contact_email ||
                                                                c
                                                                    .primary_contact
                                                                    .contact_phone ||
                                                                'No contact info'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span className='text-xs text-gray-400 italic'>
                                                        No primary contact
                                                    </span>
                                                )}
                                            </td>
                                            <td className='px-4 py-4 align-top'>
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${c.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                                                >
                                                    {c.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className='px-4 py-4 align-top text-right'>
                                                <div className='flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity'>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            navigate(
                                                                `/sales/companies/${c.id}`
                                                            )
                                                        }
                                                        className='h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                                        title='View Details'
                                                    >
                                                        <Eye className='w-4 h-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            openEdit(c)
                                                        }
                                                        className='h-8 w-8 text-blue-600 hover:bg-blue-50'
                                                        title='Edit'
                                                    >
                                                        <Edit className='w-4 h-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            handleDelete(c)
                                                        }
                                                        className='h-8 w-8 text-red-600 hover:bg-red-50'
                                                        title='Delete'
                                                    >
                                                        <Trash2 className='w-4 h-4' />
                                                    </Button>
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

            <CompanyFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                initialData={editingCompany}
                onSuccess={(result) =>
                    handleCompanySuccess(result, !editingCompany)
                }
            />
        </>
    );
};

export default CompanyListPage;
