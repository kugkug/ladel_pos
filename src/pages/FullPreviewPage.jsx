import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, Printer, Download, ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/utils';

const FullPreviewPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [
                    { data: project },
                    { data: purchaseOrders },
                    { data: deliveryReceipts },
                    { data: invoices },
                    { data: payments },
                    { data: acknowledgementReceipts }
                ] = await Promise.all([
                    supabase
                        .from('projects')
                        .select(
                            '*, company:companies(*), contact:company_contacts(*), quotations(*)'
                        )
                        .eq('id', projectId)
                        .single(),
                    supabase
                        .from('purchase_orders')
                        .select('*')
                        .eq('project_id', projectId)
                        .eq('is_deleted', false),
                    supabase
                        .from('delivery_receipts')
                        .select('*')
                        .eq('project_id', projectId)
                        .eq('is_deleted', false),
                    supabase
                        .from('invoices')
                        .select('*')
                        .eq('project_id', projectId)
                        .eq('is_deleted', false),
                    supabase
                        .from('payments')
                        .select('*')
                        .eq('project_id', projectId)
                        .eq('is_deleted', false),
                    supabase
                        .from('acknowledgement_receipts')
                        .select('*')
                        .eq('project_id', projectId)
                ]);

                if (project) {
                    project.pr_number = project.project_number;
                }

                const qt = project?.quotations;
                let normalizedQuotations = Array.isArray(qt)
                    ? qt
                    : qt
                      ? [qt]
                      : [];
                normalizedQuotations = normalizedQuotations.filter(
                    (q) => !q.is_deleted
                );

                setData({
                    project,
                    quotations: normalizedQuotations,
                    purchaseOrders: purchaseOrders || [],
                    deliveryReceipts: deliveryReceipts || [],
                    invoices: invoices || [],
                    payments: payments || [],
                    acknowledgementReceipts: acknowledgementReceipts || []
                });
            } catch (err) {
                console.error('Error fetching preview data:', err);
                toast({
                    title: 'Error',
                    description: 'Failed to load project details',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId) fetchAllData();
    }, [projectId, toast]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const { project } = data || {};
        const prNumber =
            project?.pr_number || project?.project_number || 'Unknown';
        const originalTitle = document.title;

        // Set document title temporarily to suggest filename for Save as PDF
        document.title = `Project_${prNumber}_Full_Preview`;

        toast({
            title: 'Generating PDF',
            description:
                "Please select 'Save as PDF' in the destination dropdown of the print dialog.",
            duration: 5000
        });

        setTimeout(() => {
            window.print();
            // Restore original title
            document.title = originalTitle;
        }, 500);
    };

    if (isLoading) {
        return (
            <div className='flex flex-col h-[60vh] items-center justify-center space-y-4'>
                <Loader2 className='w-10 h-10 animate-spin text-blue-600' />
                <p className='text-gray-500 font-medium animate-pulse'>
                    Loading Full Preview...
                </p>
            </div>
        );
    }

    if (!data || !data.project) {
        return (
            <div className='flex flex-col h-[50vh] items-center justify-center space-y-4 text-center'>
                <h2 className='text-2xl font-bold text-gray-800'>
                    Project Not Found
                </h2>
                <p className='text-gray-500'>
                    The project you are looking for might have been deleted or
                    does not exist.
                </p>
                <Button onClick={() => navigate('/sales/projects')}>
                    Return to Projects
                </Button>
            </div>
        );
    }

    const {
        project,
        quotations,
        deliveryReceipts,
        invoices,
        payments,
        acknowledgementReceipts,
        purchaseOrders
    } = data;
    const prNumber = project.pr_number || project.project_number || 'N/A';
    const projectIdentifier =
        prNumber !== 'N/A'
            ? `PR No: ${prNumber}`
            : `Project: ${project.project_title || 'N/A'}`;

    const createdDate = project.created_at
        ? new Date(project.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          })
        : 'N/A';
    const updatedDate = project.updated_at
        ? new Date(project.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          })
        : 'N/A';

    // Calculate Totals
    const totalQuotationAmount = quotations.reduce(
        (sum, q) => sum + Number(q.gross_amount || 0),
        0
    );

    // Try to use PO table if available, fallback to project fields
    let hasPO = false;
    let totalPOAmount = 0;

    if (purchaseOrders.length > 0) {
        hasPO = true;
        totalPOAmount = purchaseOrders.reduce(
            (sum, po) => sum + Number(po.amount || 0),
            0
        );
    } else if (project.po_type) {
        hasPO = true;
        totalPOAmount = Number(
            project.po_amount_inclusive || project.temporary_po_amount || 0
        );
    }

    const totalInvoiceAmount = invoices.reduce(
        (sum, inv) => sum + Number(inv.total_amount || 0),
        0
    );
    const totalCollectedAmount = (payments || []).reduce(
        (sum, pay) => sum + Number(pay.amount_paid || 0),
        0
    );
    const outstandingBalance = totalInvoiceAmount - totalCollectedAmount;

    return (
        <>
            <Helmet>
                <title>Full Preview - {projectIdentifier}</title>
            </Helmet>

            {/* Non-printable top action bar */}
            <div className='print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-200 pb-4 bg-white p-4 rounded-xl shadow-sm'>
                <Button
                    variant='ghost'
                    onClick={() => navigate(-1)}
                    className='text-gray-600 hover:bg-gray-100'
                >
                    <ArrowLeft className='w-4 h-4 mr-2' /> Back
                </Button>
                <div className='flex flex-wrap gap-3'>
                    <Button
                        variant='outline'
                        onClick={() => navigate(`/sales/projects/${projectId}`)}
                        className='bg-white hover:bg-gray-50'
                    >
                        <Edit className='w-4 h-4 mr-2' /> Edit Project
                    </Button>
                    <Button
                        variant='outline'
                        onClick={handlePrint}
                        className='bg-white hover:bg-gray-50 border-gray-300'
                    >
                        <Printer className='w-4 h-4 mr-2' /> Print
                    </Button>
                    <Button
                        className='bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        onClick={handleDownloadPDF}
                    >
                        <Download className='w-4 h-4 mr-2' /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Printable Area */}
            <div className='bg-white w-full max-w-5xl mx-auto print:shadow-none print:border-none shadow-sm border border-gray-200 p-6 sm:p-10 rounded-xl text-gray-900 print:p-0 print:m-0'>
                {/* Document Header Section */}
                <div className='border-b-2 border-gray-800 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-start gap-6 print:border-black'>
                    <div className='flex-1'>
                        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2 print:text-black'>
                            {projectIdentifier}
                        </h1>
                        <h2 className='text-xl text-gray-700 font-medium mb-4 print:text-gray-800'>
                            {project.project_title}
                        </h2>

                        <div className='flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-600 print:text-gray-700'>
                            <div>
                                <span className='block text-gray-400 text-xs uppercase tracking-wider font-bold mb-1'>
                                    Created
                                </span>
                                {createdDate}
                            </div>
                            <div>
                                <span className='block text-gray-400 text-xs uppercase tracking-wider font-bold mb-1'>
                                    Last Updated
                                </span>
                                {updatedDate}
                            </div>
                            <div>
                                <span className='block text-gray-400 text-xs uppercase tracking-wider font-bold mb-1'>
                                    Status
                                </span>
                                <span className='font-semibold text-gray-800'>
                                    {project.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='text-left md:text-right bg-gray-50 print:bg-transparent p-5 rounded-xl md:p-0 w-full md:w-auto border md:border-none border-gray-100 print:border-none'>
                        <p className='text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 md:mb-1'>
                            Client Information
                        </p>
                        <p className='font-bold text-xl text-gray-900 print:text-black'>
                            {project.company?.company_name || 'N/A'}
                        </p>
                        <p className='text-sm text-gray-700 font-medium mt-1'>
                            {project.contact?.contact_name || 'No Contact'}
                        </p>
                        {project.company?.company_address && (
                            <p className='text-sm text-gray-600 mt-2 max-w-xs md:ml-auto md:text-right'>
                                {project.company.company_address}
                            </p>
                        )}
                    </div>
                </div>

                <div className='space-y-8'>
                    {/* 1. Quotations Section */}
                    <section className='print-break-inside-avoid doc-section'>
                        <div className='doc-section-header'>
                            <h3 className='doc-section-title'>
                                <span className='bg-gray-200 px-2 py-1 rounded text-xs font-mono print:border print:border-gray-300'>
                                    QT
                                </span>
                                Quotations ({quotations.length})
                            </h3>
                            {quotations.length > 0 && (
                                <span className='font-bold text-gray-800 amount-display'>
                                    Total:{' '}
                                    {formatCurrency(totalQuotationAmount)}
                                </span>
                            )}
                        </div>

                        <div className='p-0'>
                            {quotations.length > 0 ? (
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-sm text-left'>
                                        <thead className='bg-white border-b border-gray-200'>
                                            <tr>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Quotation No.
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Date Issued
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Status
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600 text-right'>
                                                    Base Amount
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600 text-right'>
                                                    VAT
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-900 text-right'>
                                                    Total Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {quotations.map((qt) => (
                                                <tr
                                                    key={qt.id}
                                                    className='hover:bg-gray-50'
                                                >
                                                    <td className='px-6 py-4 font-bold text-gray-900'>
                                                        {qt.quotation_number}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600'>
                                                        {qt.date_issued ||
                                                            'N/A'}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-800'>
                                                        {qt.quotation_status}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600 text-right amount-display'>
                                                        {formatCurrency(
                                                            qt.net_amount
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600 text-right amount-display'>
                                                        {formatCurrency(
                                                            qt.vat_amount
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 font-bold text-gray-900 text-right amount-display'>
                                                        {formatCurrency(
                                                            qt.gross_amount
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className='p-6 flex justify-center'>
                                    <div className='not-created-yet'>
                                        Quotations not created yet.
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. Purchase Orders Section */}
                    <section className='print-break-inside-avoid doc-section'>
                        <div className='doc-section-header'>
                            <h3 className='doc-section-title'>
                                <span className='bg-gray-200 px-2 py-1 rounded text-xs font-mono print:border print:border-gray-300'>
                                    PO
                                </span>
                                Purchase Orders (
                                {hasPO
                                    ? purchaseOrders.length > 0
                                        ? purchaseOrders.length
                                        : 1
                                    : 0}
                                )
                            </h3>
                            {hasPO && (
                                <span className='font-bold text-gray-800 amount-display'>
                                    Total: {formatCurrency(totalPOAmount)}
                                </span>
                            )}
                        </div>

                        <div className='p-0'>
                            {hasPO ? (
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-sm text-left'>
                                        <thead className='bg-white border-b border-gray-200'>
                                            <tr>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    PO Number / Code
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Type / Date
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Terms
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600 text-right'>
                                                    Base Amount
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600 text-right'>
                                                    VAT
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-900 text-right'>
                                                    Total Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {purchaseOrders.length > 0 ? (
                                                purchaseOrders.map((po) => (
                                                    <tr
                                                        key={po.id}
                                                        className='hover:bg-gray-50'
                                                    >
                                                        <td className='px-6 py-4 font-bold text-gray-900'>
                                                            {po.po_number}
                                                        </td>
                                                        <td className='px-6 py-4 text-gray-600'>
                                                            {po.date_issued ||
                                                                'N/A'}
                                                        </td>
                                                        <td className='px-6 py-4 text-gray-800'>
                                                            -
                                                        </td>
                                                        <td className='px-6 py-4 text-gray-600 text-right'>
                                                            -
                                                        </td>
                                                        <td className='px-6 py-4 text-gray-600 text-right'>
                                                            -
                                                        </td>
                                                        <td className='px-6 py-4 font-bold text-gray-900 text-right amount-display'>
                                                            {formatCurrency(
                                                                po.amount
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className='hover:bg-gray-50'>
                                                    <td className='px-6 py-4 font-bold text-gray-900'>
                                                        {project.po_number ||
                                                            project.customer_po_number ||
                                                            project.temporary_po_code}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600'>
                                                        {project.po_type}
                                                        <br />
                                                        <span className='text-xs text-gray-400'>
                                                            {project.po_date ||
                                                                'No Date'}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-800'>
                                                        {project.payment_terms ||
                                                            'N/A'}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600 text-right amount-display'>
                                                        {project.po_amount_net
                                                            ? formatCurrency(
                                                                  project.po_amount_net
                                                              )
                                                            : '-'}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600 text-right amount-display'>
                                                        {project.po_vat_amount
                                                            ? formatCurrency(
                                                                  project.po_vat_amount
                                                              )
                                                            : '-'}
                                                    </td>
                                                    <td className='px-6 py-4 font-bold text-gray-900 text-right amount-display'>
                                                        {formatCurrency(
                                                            project.po_amount_inclusive ||
                                                                project.temporary_po_amount
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className='p-6 flex justify-center'>
                                    <div className='not-created-yet'>
                                        Purchase Order not created yet.
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 3. Delivery Receipts Section */}
                    <section className='print-break-inside-avoid doc-section'>
                        <div className='doc-section-header'>
                            <h3 className='doc-section-title'>
                                <span className='bg-gray-200 px-2 py-1 rounded text-xs font-mono print:border print:border-gray-300'>
                                    DR
                                </span>
                                Delivery Receipts ({deliveryReceipts.length})
                            </h3>
                        </div>

                        <div className='p-0'>
                            {deliveryReceipts.length > 0 ? (
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-sm text-left'>
                                        <thead className='bg-white border-b border-gray-200'>
                                            <tr>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    DR Number
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Date Delivered
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Status
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Notes
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {deliveryReceipts.map((dr) => (
                                                <tr
                                                    key={dr.id}
                                                    className='hover:bg-gray-50'
                                                >
                                                    <td className='px-6 py-4 font-bold text-gray-900'>
                                                        {dr.dr_number}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600'>
                                                        {dr.date_delivered}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-800 font-medium'>
                                                        {dr.dr_status}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-500 max-w-xs truncate'>
                                                        {dr.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className='p-6 flex justify-center'>
                                    <div className='not-created-yet'>
                                        Delivery Receipts not created yet.
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 4. Invoices Section */}
                    <section className='print-break-inside-avoid doc-section'>
                        <div className='doc-section-header'>
                            <h3 className='doc-section-title'>
                                <span className='bg-gray-200 px-2 py-1 rounded text-xs font-mono print:border print:border-gray-300'>
                                    INV
                                </span>
                                Invoices ({invoices.length})
                            </h3>
                            {invoices.length > 0 && (
                                <span className='font-bold text-gray-800 amount-display'>
                                    Total: {formatCurrency(totalInvoiceAmount)}
                                </span>
                            )}
                        </div>

                        <div className='p-0'>
                            {invoices.length > 0 ? (
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-sm text-left'>
                                        <thead className='bg-white border-b border-gray-200'>
                                            <tr>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Invoice Number
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Dates
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Status
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600 text-right'>
                                                    Base Amount
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600 text-right'>
                                                    VAT
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-900 text-right'>
                                                    Total Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {invoices.map((inv) => (
                                                <tr
                                                    key={inv.id}
                                                    className='hover:bg-gray-50'
                                                >
                                                    <td className='px-6 py-4 font-bold text-gray-900'>
                                                        {inv.invoice_number}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600'>
                                                        <div>
                                                            Inv:{' '}
                                                            {inv.invoice_date}
                                                        </div>
                                                        <div className='text-xs text-gray-400 mt-0.5'>
                                                            Due: {inv.due_date}
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-800 font-medium'>
                                                        {
                                                            inv.invoice_issue_status
                                                        }
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600 text-right amount-display'>
                                                        {formatCurrency(
                                                            inv.base_amount
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600 text-right amount-display'>
                                                        {formatCurrency(
                                                            inv.vat_amount
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 font-bold text-blue-700 text-right amount-display'>
                                                        {formatCurrency(
                                                            inv.total_amount
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className='p-6 flex justify-center'>
                                    <div className='not-created-yet'>
                                        Invoices not created yet.
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 5. Payments & Collection Section */}
                    <section className='print-break-inside-avoid doc-section'>
                        <div className='doc-section-header'>
                            <h3 className='doc-section-title'>
                                <span className='bg-gray-200 px-2 py-1 rounded text-xs font-mono print:border print:border-gray-300'>
                                    PAY
                                </span>
                                Acknowledgement Receipts ({payments.length})
                            </h3>
                            <span className='font-bold text-gray-800 amount-display'>
                                Collected:{' '}
                                {formatCurrency(totalCollectedAmount)}
                            </span>
                        </div>

                        <div className='p-6 border-b border-gray-100'>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
                                    <p className='text-sm font-medium text-gray-500'>
                                        Total Invoiced
                                    </p>
                                    <p className='font-bold text-2xl text-gray-900 mt-1 amount-display'>
                                        {formatCurrency(totalInvoiceAmount)}
                                    </p>
                                </div>
                                <div className='bg-green-50 p-4 rounded-xl border border-green-200'>
                                    <p className='text-sm font-medium text-green-700'>
                                        Total Collected
                                    </p>
                                    <p className='font-bold text-2xl text-green-800 mt-1 amount-display'>
                                        {formatCurrency(totalCollectedAmount)}
                                    </p>
                                </div>
                                <div className='bg-red-50 p-4 rounded-xl border border-red-200'>
                                    <p className='text-sm font-medium text-red-700'>
                                        Outstanding Balance
                                    </p>
                                    <p className='font-bold text-2xl text-red-800 mt-1 amount-display'>
                                        {formatCurrency(outstandingBalance)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='p-0'>
                            {payments.length > 0 ? (
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-sm text-left'>
                                        <thead className='bg-white border-b border-gray-200'>
                                            <tr>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Date
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Method & Ref
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-600'>
                                                    Notes
                                                </th>
                                                <th className='px-6 py-3 font-semibold text-gray-900 text-right'>
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {payments.map((pay) => (
                                                <tr
                                                    key={pay.id}
                                                    className='hover:bg-gray-50'
                                                >
                                                    <td className='px-6 py-4 font-medium text-gray-900'>
                                                        {pay.payment_date ||
                                                            'N/A'}
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-600'>
                                                        <div>
                                                            {pay.payment_method ||
                                                                'N/A'}
                                                        </div>
                                                        <div className='text-xs text-gray-400 mt-0.5'>
                                                            {pay.reference_no ||
                                                                'No Ref'}
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 text-gray-500 max-w-xs truncate'>
                                                        {pay.notes || '-'}
                                                    </td>
                                                    <td className='px-6 py-4 font-bold text-green-700 text-right amount-display'>
                                                        {formatCurrency(
                                                            pay.amount_paid
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className='p-6 flex justify-center'>
                                    <div className='not-created-yet'>
                                        Payments not recorded yet.
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default FullPreviewPage;
