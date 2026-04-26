import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Wallet,
    HandCoins,
    RefreshCcw,
    Handshake,
    ChevronRight
} from 'lucide-react';

const ReportsExcelHubPage = () => {
    const navigate = useNavigate();

    const options = [
        {
            id: 'sales',
            title: 'Sales',
            description:
                'Extract sales records into Excel-ready output for monthly and project reviews.',
            icon: BarChart3,
            color: 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white',
            border: 'hover:border-blue-500'
        },
        {
            id: 'collections',
            title: 'Collections',
            description:
                'Generate Excel export of expected and scheduled collections per customer.',
            icon: Wallet,
            color: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
            border: 'hover:border-emerald-500'
        },
        {
            id: 'collected',
            title: 'Collected',
            description:
                'Produce extracted Excel data for completed and verified collected amounts.',
            icon: HandCoins,
            color: 'bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
            border: 'hover:border-amber-500'
        },
        {
            id: 'reimbursements',
            title: 'Reimbursements',
            description:
                'Prepare Excel extraction for reimbursement transactions and audit reference.',
            icon: RefreshCcw,
            color: 'bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white',
            border: 'hover:border-purple-500'
        },
        {
            id: 'share-profit',
            title: 'Share Profit',
            description:
                'Extract profit-sharing figures and allocations to spreadsheet format.',
            icon: Handshake,
            color: 'bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white',
            border: 'hover:border-rose-500'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Reports - Excel extraction</title>
            </Helmet>

            <div className='animate-in fade-in duration-300 max-w-6xl mx-auto pb-12'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900'>
                            Select Report Type
                        </h1>
                        <p className='text-gray-500 mt-1'>
                            Choose which report category you want to extract to
                            Excel
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {options.map((option) => (
                        <div
                            key={option.id}
                            role='button'
                            tabIndex={0}
                            onClick={() => navigate(`/reports/${option.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(`/reports/${option.id}`);
                                }
                            }}
                            className={`bg-white p-6 rounded-2xl border-2 border-transparent shadow-sm cursor-pointer transition-all duration-300 group hover:shadow-md ${option.border}`}
                        >
                            <div className='flex items-start gap-5'>
                                <div
                                    className={`p-4 rounded-xl transition-colors duration-300 ${option.color}`}
                                >
                                    <option.icon className='w-8 h-8' />
                                </div>
                                <div className='flex-1'>
                                    <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors'>
                                        {option.title}
                                    </h3>
                                    <p className='text-gray-500 text-sm leading-relaxed'>
                                        {option.description}
                                    </p>
                                </div>
                                <ChevronRight className='w-5 h-5 text-gray-300 group-hover:text-gray-500 transform group-hover:translate-x-1 transition-all mt-1' />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ReportsExcelHubPage;
