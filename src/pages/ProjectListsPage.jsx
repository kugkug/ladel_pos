import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ProjectContext } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
    Plus,
    FileText,
    Clipboard,
    Package,
    DollarSign,
    WrapText as ReceiptText,
    Eye,
    Trash2,
    RefreshCcw,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import ProjectFilterBar from '@/components/ProjectFilterBar';
import { fetchUserProfiles, mapUserIdToName } from '@/lib/userProfileUtils';
import { applyAllFilters } from '@/lib/projectFilterUtils';
import { exportToCSV, generateFilename } from '@/lib/csvExport';
import DeleteProjectModal from '@/components/DeleteProjectModal';
import { formatCurrency } from '@/lib/utils';

const StatusBadge = ({ status }) => {
    let color = 'bg-gray-100 text-gray-700';
    if (['Paid', 'Confirmed', 'Completed Issued', 'Completed'].includes(status))
        color = 'bg-green-100 text-green-700';
    if (
        [
            'Partial',
            'Partial Issued',
            'Pending',
            'Temporary PO',
            'Customer PO'
        ].includes(status)
    )
        color = 'bg-yellow-100 text-yellow-700';
    if (['Unpaid', 'Canceled', 'Not Started', 'Not Issued'].includes(status))
        color = 'bg-red-100 text-red-700';
    return (
        <span
            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}
        >
            {status || 'Unpaid'}
        </span>
    );
};

const DocIcon = ({ icon: Icon, exists, status, tooltipText, onClick }) => {
    let color = 'text-gray-300';
    if (exists) {
        color = 'text-blue-500';
        if (
            ['Completed', 'Completed Issued', 'Paid', 'Confirmed'].includes(
                status
            )
        )
            color = 'text-green-500';
        else if (['Partial', 'Partial Issued'].includes(status))
            color = 'text-yellow-500';
    }
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        onClick={onClick}
                        className={`p-1.5 rounded-md transition-colors ${exists ? 'cursor-pointer hover:bg-blue-50 hover:shadow-sm' : 'cursor-default'}`}
                    >
                        <Icon className={`w-5 h-5 mx-auto ${color}`} />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className='font-semibold text-xs'>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const ProjectListsPage = () => {
    const { projects, isLoading, fetchProjects } = useContext(ProjectContext);
    const { currentUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        search: '',
        company: 'All',
        datePreset: null,
        dateRange: { start: null, end: null },
        customDateActive: false
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [userProfiles, setUserProfiles] = useState(new Map());

    useEffect(() => {
        const loadProfiles = async () => {
            const profiles = await fetchUserProfiles();
            setUserProfiles(profiles);
        };
        loadProfiles();
    }, []);

    const filteredProjects = useMemo(() => {
        return applyAllFilters(projects, filters);
    }, [projects, filters]);

    const handleNavigateToProject = (e, projectId) => {
        e.stopPropagation();
        navigate(`/sales/projects/${projectId}`);
    };

    const handleNavigateToPreview = (e, projectId) => {
        e.stopPropagation();
        navigate(`/sales/projects/${projectId}/full-preview`);
    };

    const initiateDelete = (e, project) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setDeleteModalOpen(true);
    };

    const handleExportProjects = () => {
        if (filteredProjects.length === 0) {
            toast({ title: 'Notice', description: 'No projects to export.' });
            return;
        }

        const headers = [
            'PR Number',
            'Project Name',
            'Client Name',
            'Contact Person',
            'Date Created',
            'QT Number',
            'QT Status',
            'PO Number',
            'PO Status',
            'DR Number',
            'DR Status',
            'Invoice Number',
            'INV Status',
            'AR Number',
            'AR Status',
            'Overall Status'
        ];

        const data = filteredProjects.map((p) => [
            p.pr_number || p.project_number || '',
            p.project_title || '',
            p.companyName || '',
            p.contact_name || '',
            p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
            p.qt_number || p.quotation?.quotation_number || '-',
            p.quotation?.quotation_status || 'No Quotation',
            p.po_number || p.customer_po_number || p.temporary_po_code || '-',
            p.po_type && !p.po_is_deleted ? 'Confirmed' : 'No PO',
            p.dr_number || '-',
            p.delivery_status || 'Not Started',
            p.invoice_number || '-',
            p.invoice_status || 'Not Issued',
            p.ar_number || '-',
            p.payment_status || 'Unpaid',
            p.status || 'Unpaid'
        ]);

        exportToCSV(data, generateFilename('Projects'), headers);
        toast({
            title: 'Success',
            description: `Exported ${filteredProjects.length} projects successfully.`
        });
    };

    return (
        <>
            <Helmet>
                <title>Projects - Pipeline</title>
            </Helmet>
            <div className='max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900'>
                            Project Pipeline
                        </h1>
                        <p className='text-gray-500 mt-1'>
                            Manage sales projects and monitor document flows
                        </p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Button
                            onClick={handleExportProjects}
                            className='bg-blue-600 hover:bg-blue-700 text-white font-bold h-11'
                        >
                            <Download className='w-5 h-5 mr-2' /> Export CSV
                        </Button>
                        <Button
                            onClick={() => navigate('/sales/data-entry')}
                            className='bg-blue-600 hover:bg-blue-700 text-white font-bold h-11'
                        >
                            <Plus className='w-5 h-5 mr-2' /> New Project
                        </Button>
                    </div>
                </div>

                {/* Project Filters */}
                <ProjectFilterBar
                    filters={filters}
                    setFilters={setFilters}
                    projects={projects}
                    isLoading={isLoading}
                />

                <div className='flex justify-between items-center mb-2 px-1'>
                    <span className='text-sm font-medium text-gray-600'>
                        {isLoading
                            ? 'Loading projects...'
                            : `Showing ${filteredProjects.length} of ${projects?.length || 0} projects`}
                    </span>
                </div>

                <div className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-4'>
                    <div className='overflow-auto max-h-[calc(100vh-220px)]'>
                        <table className='w-full text-left min-w-[1000px]'>
                            <thead className='bg-[#1B4D5C] text-white'>
                                <tr>
                                    <th className='px-4 py-3 text-xs font-semibold uppercase tracking-wider'>
                                        PR Number & Project
                                    </th>
                                    <th className='px-4 py-3 text-xs font-semibold uppercase tracking-wider'>
                                        Client Name
                                    </th>
                                    <th className='px-4 py-3 text-xs font-semibold uppercase tracking-wider'>
                                        Amount
                                    </th>
                                    <th className='px-4 py-3 text-xs font-semibold uppercase tracking-wider'>
                                        Dates
                                    </th>
                                    <th className='px-2 py-3 text-xs font-semibold uppercase tracking-wider text-center'>
                                        QT
                                    </th>
                                    <th className='px-2 py-3 text-xs font-semibold uppercase tracking-wider text-center'>
                                        PO
                                    </th>
                                    <th className='px-2 py-3 text-xs font-semibold uppercase tracking-wider text-center'>
                                        DR
                                    </th>
                                    <th className='px-2 py-3 text-xs font-semibold uppercase tracking-wider text-center'>
                                        INV
                                    </th>
                                    <th className='px-2 py-3 text-xs font-semibold uppercase tracking-wider text-center'>
                                        AR
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan='8'
                                            className='text-center py-16'
                                        >
                                            <div className='flex flex-col items-center justify-center space-y-3'>
                                                <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                                                <p className='text-gray-500 font-medium text-sm'>
                                                    Loading your pipeline...
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : projects.length > 0 &&
                                  filteredProjects.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan='8'
                                            className='text-center py-16'
                                        >
                                            <div className='flex flex-col items-center justify-center space-y-3'>
                                                <p className='text-gray-600 font-medium text-lg'>
                                                    No projects match filters
                                                </p>
                                                <p className='text-gray-400 text-sm'>
                                                    Try adjusting your search
                                                    criteria or resetting
                                                    filters.
                                                </p>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() =>
                                                        setFilters({
                                                            search: '',
                                                            company: 'All',
                                                            datePreset: null,
                                                            dateRange: {
                                                                start: null,
                                                                end: null
                                                            },
                                                            customDateActive: false
                                                        })
                                                    }
                                                    className='mt-2'
                                                >
                                                    Reset Filters
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : projects.length === 0 && !isLoading ? (
                                    <tr>
                                        <td
                                            colSpan='8'
                                            className='text-center py-16'
                                        >
                                            <div className='flex flex-col items-center justify-center space-y-3'>
                                                <p className='text-gray-600 font-medium text-lg'>
                                                    No projects found
                                                </p>
                                                <p className='text-gray-400 text-sm'>
                                                    It looks like there are no
                                                    projects in your pipeline
                                                    yet or they failed to load.
                                                </p>
                                                <div className='flex gap-3 mt-4'>
                                                    <Button
                                                        variant='outline'
                                                        onClick={fetchProjects}
                                                    >
                                                        <RefreshCcw className='w-4 h-4 mr-2' />{' '}
                                                        Retry
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            navigate(
                                                                '/sales/data-entry'
                                                            )
                                                        }
                                                        className='bg-blue-600 hover:bg-blue-700 text-white'
                                                    >
                                                        Create First Project
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProjects.map((p) => {
                                        const amount =
                                            p.quotations?.gross_amount || 0;
                                        const qt = p.quotation;
                                        const prNumber =
                                            p.pr_number || p.project_number;
                                        const createdDate = p.created_at
                                            ? new Date(
                                                  p.created_at
                                              ).toLocaleDateString()
                                            : 'N/A';

                                        const creatorId =
                                            p.created_by || p.deleted_by;
                                        const creatorName = creatorId
                                            ? mapUserIdToName(
                                                  creatorId,
                                                  userProfiles
                                              )
                                            : '';

                                        return (
                                            <tr
                                                key={p.id}
                                                className='hover:bg-blue-50/50 transition-colors cursor-pointer group'
                                                onClick={(e) =>
                                                    handleNavigateToProject(
                                                        e,
                                                        p.id
                                                    )
                                                }
                                            >
                                                <td className='px-4 py-4 align-top w-[30%]'>
                                                    <div className='flex flex-col sm:flex-row sm:items-center gap-2 mb-2'>
                                                        <p className='font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg'>
                                                            PR No:{' '}
                                                            {prNumber || '—'}
                                                        </p>
                                                        <StatusBadge
                                                            status={p.status}
                                                        />
                                                    </div>
                                                    <div className='mb-2 flex items-center gap-2'>
                                                        <Button
                                                            variant='default'
                                                            size='sm'
                                                            className='text-xs h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                                            onClick={(e) =>
                                                                handleNavigateToPreview(
                                                                    e,
                                                                    p.id
                                                                )
                                                            }
                                                        >
                                                            <Eye className='w-3.5 h-3.5 mr-1.5' />
                                                            Preview
                                                        </Button>
                                                        <Button
                                                            variant='destructive'
                                                            size='sm'
                                                            className='text-xs h-7 px-3 shadow-sm bg-red-600 hover:bg-red-700'
                                                            onClick={(e) =>
                                                                initiateDelete(
                                                                    e,
                                                                    p
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className='w-3.5 h-3.5 mr-1.5' />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                    <p
                                                        className='text-sm text-gray-600 mt-1 line-clamp-2'
                                                        title={p.project_title}
                                                    >
                                                        {p.project_title}
                                                    </p>
                                                </td>
                                                <td className='px-4 py-4 align-top w-[25%]'>
                                                    <p className='text-sm font-semibold text-gray-800'>
                                                        {p.companyName}
                                                    </p>
                                                    <p className='text-xs text-gray-500 mt-1'>
                                                        {p.contact_name ||
                                                            'No Contact'}
                                                    </p>
                                                </td>
                                                <td>
                                                    <p className='text-sm font-semibold text-gray-800'>
                                                        {formatCurrency(amount)}
                                                    </p>
                                                </td>
                                                <td className='px-4 py-4 align-top w-[15%]'>
                                                    <div className='text-xs text-gray-600 space-y-1'>
                                                        <p>
                                                            <span className='text-gray-400'>
                                                                Created:
                                                            </span>{' '}
                                                            {createdDate}
                                                        </p>
                                                        {creatorName && (
                                                            <p className='text-[10px] text-gray-400 mt-0.5'>
                                                                By:{' '}
                                                                {creatorName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className='px-1 py-4 align-middle text-center'>
                                                    <DocIcon
                                                        icon={FileText}
                                                        exists={!!qt}
                                                        status={
                                                            qt?.quotation_status
                                                        }
                                                        tooltipText={
                                                            qt
                                                                ? `QT: ${qt.quotation_status}`
                                                                : 'No Quotation'
                                                        }
                                                        onClick={(e) => {
                                                            if (qt)
                                                                handleNavigateToProject(
                                                                    e,
                                                                    p.id
                                                                );
                                                        }}
                                                    />
                                                </td>
                                                <td className='px-1 py-4 align-middle text-center'>
                                                    <DocIcon
                                                        icon={Clipboard}
                                                        exists={
                                                            !!p.po_type &&
                                                            !p.po_is_deleted
                                                        }
                                                        status={
                                                            p.po_type
                                                                ? 'Confirmed'
                                                                : ''
                                                        }
                                                        tooltipText={
                                                            p.po_type &&
                                                            !p.po_is_deleted
                                                                ? `PO: ${p.po_number || p.customer_po_number || p.temporary_po_code}`
                                                                : 'No PO'
                                                        }
                                                        onClick={(e) => {
                                                            if (p.po_type)
                                                                handleNavigateToProject(
                                                                    e,
                                                                    p.id
                                                                );
                                                        }}
                                                    />
                                                </td>
                                                <td className='px-1 py-4 align-middle text-center'>
                                                    <DocIcon
                                                        icon={Package}
                                                        exists={
                                                            !!p.delivery_status &&
                                                            p.delivery_status !==
                                                                'Not Started'
                                                        }
                                                        status={
                                                            p.delivery_status
                                                        }
                                                        tooltipText={`DR Status: ${p.delivery_status || 'Not Started'}`}
                                                        onClick={(e) => {
                                                            if (
                                                                p.delivery_status &&
                                                                p.delivery_status !==
                                                                    'Not Started'
                                                            )
                                                                handleNavigateToProject(
                                                                    e,
                                                                    p.id
                                                                );
                                                        }}
                                                    />
                                                </td>
                                                <td className='px-1 py-4 align-middle text-center'>
                                                    <DocIcon
                                                        icon={DollarSign}
                                                        exists={
                                                            !!p.invoice_status &&
                                                            p.invoice_status !==
                                                                'Not Issued'
                                                        }
                                                        status={
                                                            p.invoice_status
                                                        }
                                                        tooltipText={`Invoice: ${p.invoice_status || 'Not Issued'}`}
                                                        onClick={(e) => {
                                                            if (
                                                                p.invoice_status &&
                                                                p.invoice_status !==
                                                                    'Not Issued'
                                                            )
                                                                handleNavigateToProject(
                                                                    e,
                                                                    p.id
                                                                );
                                                        }}
                                                    />
                                                </td>
                                                <td className='px-1 py-4 align-middle text-center'>
                                                    <DocIcon
                                                        icon={ReceiptText}
                                                        exists={
                                                            !!p.payment_status &&
                                                            p.payment_status !==
                                                                'Unpaid'
                                                        }
                                                        status={
                                                            p.payment_status
                                                        }
                                                        tooltipText={`Payment: ${p.payment_status || 'Unpaid'}`}
                                                        onClick={(e) => {
                                                            if (
                                                                p.payment_status &&
                                                                p.payment_status !==
                                                                    'Unpaid'
                                                            )
                                                                handleNavigateToProject(
                                                                    e,
                                                                    p.id
                                                                );
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteProjectModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                project={projectToDelete}
                onSuccess={() => fetchProjects()}
            />
        </>
    );
};

export default ProjectListsPage;
