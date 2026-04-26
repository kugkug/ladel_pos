import React, { useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
    ArrowLeft,
    FileSpreadsheet,
    UploadCloud,
    CalendarRange,
    FileDown
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ReportExcelExtractionTemplate = ({
    title,
    description,
    backPath = '/reports',
    reportSlug,
    onGenerateReport
}) => {
    const fileInputRef = useRef(null);
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [dateFrom, setDateFrom] = useState(() =>
        format(startOfMonth(new Date()), 'yyyy-MM-dd')
    );
    const [dateTo, setDateTo] = useState(() =>
        format(endOfMonth(new Date()), 'yyyy-MM-dd')
    );

    const slug =
        reportSlug ||
        title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        toast({
            title: `${title} file selected`,
            description: `${file.name} is ready. Connect your Excel extraction logic in this component.`
        });
    };

    const downloadPlaceholderCsv = useCallback(() => {
        const generatedAt = new Date().toISOString();
        const rows = [
            ['Report', 'Date from', 'Date to', 'Generated at'],
            [title, dateFrom, dateTo, generatedAt]
        ];
        const body = rows
            .map((r) =>
                r
                    .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                    .join(',')
            )
            .join('\n');
        const csv = `\uFEFF${body}`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}_${dateFrom}_${dateTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [dateFrom, dateTo, slug, title]);

    const handleGenerateReport = async () => {
        if (!dateFrom || !dateTo) {
            toast({
                variant: 'destructive',
                title: 'Date range required',
                description: 'Please choose both a start date and an end date.'
            });
            return;
        }
        if (dateFrom > dateTo) {
            toast({
                variant: 'destructive',
                title: 'Invalid range',
                description: 'Start date must be on or before the end date.'
            });
            return;
        }

        setIsGenerating(true);
        try {
            if (onGenerateReport) {
                await onGenerateReport({ dateFrom, dateTo, reportSlug: slug });
            } else {
                downloadPlaceholderCsv();
                toast({
                    title: 'Report generated',
                    description: `Placeholder CSV for ${title} (${format(new Date(dateFrom), 'MMM d, yyyy')} – ${format(new Date(dateTo), 'MMM d, yyyy')}). Replace with your API or export logic in onGenerateReport.`
                });
            }
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Could not generate report',
                description: err?.message || 'Something went wrong. Try again.'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>{title} - Reports</title>
            </Helmet>

            <div className='max-w-4xl mx-auto animate-in fade-in duration-300 pb-12'>
                <button
                    type='button'
                    onClick={() => navigate(backPath)}
                    className='inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6'
                >
                    <ArrowLeft className='w-4 h-4' />
                    Back to Reports
                </button>

                <div className='bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8'>
                    <div className='flex items-start gap-4'>
                        <div className='p-3 rounded-xl bg-emerald-100 text-emerald-700'>
                            <FileSpreadsheet className='w-7 h-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                {title}
                            </h1>
                            <p className='text-gray-500 mt-1'>{description}</p>
                        </div>
                    </div>

                    <div className='rounded-xl border border-gray-200 bg-gray-50/80 p-6 space-y-4'>
                        <div className='flex items-center gap-2 text-gray-900 font-semibold'>
                            <CalendarRange className='w-5 h-5 text-emerald-600' />
                            Report period
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor={`${slug}-from`}>From</Label>
                                <Input
                                    id={`${slug}-from`}
                                    type='date'
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className='bg-white'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor={`${slug}-to`}>To</Label>
                                <Input
                                    id={`${slug}-to`}
                                    type='date'
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className='bg-white'
                                />
                            </div>
                        </div>
                        <Button
                            type='button'
                            className='w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700'
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                        >
                            <FileDown className='w-4 h-4 mr-2' />
                            {isGenerating ? 'Generating…' : 'Generate report'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportExcelExtractionTemplate;
