import React from 'react';
import { Helmet } from 'react-helmet';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DailyRemindersPanel from '@/components/DailyRemindersPanel';
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext';
import { useAuth } from '@/contexts/AuthContext';

import ProjectsOngoingTable from '@/components/ProjectsOngoingTable';
import UpcomingCollectionsTable from '@/components/UpcomingCollectionsTable';
import OverdueReceivablesTable from '@/components/OverdueReceivablesTable';
import PendingQuotationsTable from '@/components/PendingQuotationsTable';

import '@/styles/dashboard.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { refreshTrigger } = useDashboardRefresh();
    const { userRole, permissions } = useAuth();
    const logoUrl =
        'https://horizons-cdn.hostinger.com/056d7d60-630a-4d73-9050-17a85fc3d26f/82f908891348f4835b3f154ca601a27c.png';

    const handleManualRefresh = () => {
        window.location.reload();
    };

    // Safe check for staff with missing permissions record
    const isStaffWithoutPermissions =
        userRole === 'STAFF' &&
        (!permissions || Object.keys(permissions).length === 0);

    if (isStaffWithoutPermissions) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[60vh] text-center px-4'>
                <Helmet>
                    <title>Pending Access - APEX Hub</title>
                </Helmet>
                <AlertTriangle className='w-16 h-16 text-orange-500 mb-4' />
                <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                    Access Pending
                </h2>
                <p className='text-gray-600 max-w-md mb-6'>
                    Your account has been created, but permissions have not been
                    assigned yet. Please contact your administrator to set up
                    your access controls.
                </p>
                <button
                    onClick={handleManualRefresh}
                    className='apex-btn-outline'
                >
                    <RefreshCw className='w-4 h-4' /> Refresh Status
                </button>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Dashboard - APEX</title>
            </Helmet>

            <div className='space-y-8 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-300'>
                <div className='apex-dashboard-header'>
                    <div>
                        <h1 className='apex-dashboard-title'>
                            <img
                                src={logoUrl}
                                alt='APEX Logo'
                                className='h-10 object-contain bg-white/10 p-1 rounded-md backdrop-blur-sm border border-white/20'
                            />
                            APEX Dashboard
                        </h1>
                        <p className='apex-dashboard-subtitle'>
                            Real-time overview of collections, projects, and
                            reminders.
                        </p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={handleManualRefresh}
                            className='apex-btn-outline'
                        >
                            <RefreshCw className='w-4 h-4' /> Refresh
                        </button>
                        <button
                            onClick={() => navigate('/sales/data-entry')}
                            className='apex-btn-primary'
                        >
                            <FileText className='w-5 h-5' /> New Data Entry
                        </button>
                    </div>
                </div>

                <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 items-start'>
                    <div className='xl:col-span-2'>
                        <div className='dashboard-tables'>
                            <OverdueReceivablesTable
                                key={`overdue-${refreshTrigger}`}
                            />
                            <UpcomingCollectionsTable
                                key={`upcoming-${refreshTrigger}`}
                            />
                            <ProjectsOngoingTable
                                key={`ongoing-${refreshTrigger}`}
                            />
                            <PendingQuotationsTable
                                key={`pending-${refreshTrigger}`}
                            />
                        </div>
                    </div>

                    <div className='xl:col-span-1 h-full min-h-[500px]'>
                        <DailyRemindersPanel />
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
