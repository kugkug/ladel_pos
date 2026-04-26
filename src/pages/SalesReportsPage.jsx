import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReceivablesReport from './sales/reports/ReceivablesReport';
import GrossSalesReport from './sales/reports/GrossSalesReport';
import CashReceiptsReport from './sales/reports/CashReceiptsReport';
import ProjectInProgressReport from './sales/reports/ProjectInProgressReport';
import AwaitingApprovalReport from './sales/reports/AwaitingApprovalReport';
import { BarChart3, ChevronRight, Home } from 'lucide-react';

const SalesReportsPage = () => {
    return (
        <>
            <Helmet>
                <title>Sales Reports - ProjectManager</title>
                <meta
                    name='description'
                    content='Detailed financial and operational reports for the Sales Module'
                />
            </Helmet>

            <div className='space-y-6 animate-in fade-in duration-300'>
                {/* Breadcrumb Navigation Only */}
                <nav
                    className='flex items-center text-sm text-gray-500 mb-2'
                    aria-label='Breadcrumb'
                >
                    <ol className='inline-flex items-center space-x-1 md:space-x-3'>
                        <li className='inline-flex items-center'>
                            <Link
                                to='/dashboard'
                                className='inline-flex items-center hover:text-primary transition-colors'
                            >
                                <Home className='w-4 h-4 mr-2' /> Home
                            </Link>
                        </li>
                        <li>
                            <div className='flex items-center'>
                                <ChevronRight className='w-4 h-4 mx-1' />
                                <span className='text-gray-900 font-medium'>
                                    Sales Reports
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div className='flex items-center gap-3 border-b pb-4 border-gray-200'>
                    <div className='p-3 bg-primary/10 text-primary rounded-xl'>
                        <BarChart3 className='w-8 h-8' />
                    </div>
                    <div>
                        <h1 className='text-3xl font-bold text-secondary'>
                            Sales Reports
                        </h1>
                        <p className='text-muted-foreground mt-1'>
                            Comprehensive overview of financial and project
                            statuses
                        </p>
                    </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm border border-border p-2 sm:p-6'>
                    <Tabs defaultValue='receivables' className='w-full'>
                        <TabsList className='grid w-full max-w-4xl grid-cols-2 md:grid-cols-5 h-auto mb-8 bg-muted/50 p-1'>
                            <TabsTrigger
                                value='receivables'
                                className='data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-semibold transition-all'
                            >
                                Receivables
                            </TabsTrigger>
                            <TabsTrigger
                                value='gross_sales'
                                className='data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-semibold transition-all'
                            >
                                Gross Sales
                            </TabsTrigger>
                            <TabsTrigger
                                value='cash_receipts'
                                className='data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-semibold transition-all'
                            >
                                Cash Receipts
                            </TabsTrigger>
                            <TabsTrigger
                                value='in_progress'
                                className='data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-semibold transition-all'
                            >
                                In Progress
                            </TabsTrigger>
                            <TabsTrigger
                                value='awaiting_approval'
                                className='data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2.5 rounded-lg text-sm font-semibold transition-all'
                            >
                                Awaiting Approval
                            </TabsTrigger>
                        </TabsList>

                        <div className='mt-4'>
                            <TabsContent
                                value='receivables'
                                className='m-0 focus-visible:outline-none focus-visible:ring-0'
                            >
                                <div className='mb-4 flex items-center justify-between'>
                                    <h2 className='text-xl font-bold text-secondary'>
                                        Overdue & Upcoming Collections
                                    </h2>
                                </div>
                                <ReceivablesReport />
                            </TabsContent>

                            <TabsContent
                                value='gross_sales'
                                className='m-0 focus-visible:outline-none focus-visible:ring-0'
                            >
                                <div className='mb-4 flex items-center justify-between'>
                                    <h2 className='text-xl font-bold text-secondary'>
                                        Gross Sales Report
                                    </h2>
                                </div>
                                <GrossSalesReport />
                            </TabsContent>

                            <TabsContent
                                value='cash_receipts'
                                className='m-0 focus-visible:outline-none focus-visible:ring-0'
                            >
                                <div className='mb-4 flex items-center justify-between'>
                                    <h2 className='text-xl font-bold text-secondary'>
                                        Cash Receipts Report
                                    </h2>
                                </div>
                                <CashReceiptsReport />
                            </TabsContent>

                            <TabsContent
                                value='in_progress'
                                className='m-0 focus-visible:outline-none focus-visible:ring-0'
                            >
                                <div className='mb-4 flex items-center justify-between'>
                                    <h2 className='text-xl font-bold text-secondary'>
                                        Projects In Progress
                                    </h2>
                                </div>
                                <ProjectInProgressReport />
                            </TabsContent>

                            <TabsContent
                                value='awaiting_approval'
                                className='m-0 focus-visible:outline-none focus-visible:ring-0'
                            >
                                <div className='mb-4 flex items-center justify-between'>
                                    <h2 className='text-xl font-bold text-secondary'>
                                        Awaiting Approval Report
                                    </h2>
                                </div>
                                <AwaitingApprovalReport />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default SalesReportsPage;
