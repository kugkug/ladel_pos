import React from 'react';
import ReportExcelExtractionTemplate from './ReportExcelExtractionTemplate';
import ExcelJS from 'exceljs';
import { supabase } from '@/lib/customSupabaseClient';

const COLLECTIONS_EXCEL_HEADERS = [
    'Customer Name / Supplier',
    'Project No.',
    'PO Number',
    'Order Description',
    'Expiration Day'
];

export async function generateCollectionsExcelExtraction(options = {}) {
    const fetchCollectionsRows = async ({ dateFrom, dateTo } = {}) => {
        let query = supabase
            .from('projects')
            .select(
                `
                project_number,
                project_title,
                po_number,
              companies!inner (company_name)
            ),
            invoices!inner (
              invoice_number,
              due_date
            )`
            )
            .eq('is_deleted', false)
            .eq('invoices.is_deleted', false)
            .gte('invoices.due_date', dateFrom)
            .lte('invoices.due_date', dateTo);
        const { data, error } = await query;
        if (error) {
            throw error;
        }

        return (data || []).map((proj) => ({
            customerName: proj.companies?.company_name || '',
            projectNo: proj.project_number || '',
            poNumber: proj.po_number || '',
            orderDescription: proj.project_title || '',
            expirationDay: proj.invoices?.due_date || ''
        }));
    };

    const rows = await fetchCollectionsRows({
        dateFrom: options.dateFrom,
        dateTo: options.dateTo
    });

    const filename = `collections-extraction-${options.dateFrom}-${options.dateTo}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Collections');

    worksheet.mergeCells('A1:E1');

    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'COLLECTIONS';
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5CC27' }
    };
    titleCell.font = { bold: true };

    const customerNameCell = worksheet.getCell('A2');
    customerNameCell.alignment = { horizontal: 'center', vertical: 'middle' };
    customerNameCell.border = {
        top: { style: 'thin', color: { argb: '00000000' } },
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } }
    };
    customerNameCell.font = { bold: true };

    const projectNoCell = worksheet.getCell('B2');
    projectNoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    projectNoCell.border = {
        top: { style: 'thin', color: { argb: '00000000' } },
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } }
    };
    projectNoCell.font = { bold: true };

    const poNumberCell = worksheet.getCell('C2');
    poNumberCell.alignment = { horizontal: 'center', vertical: 'middle' };
    poNumberCell.border = {
        top: { style: 'thin', color: { argb: '00000000' } },
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
}
const CollectionsExcelExtraction = () => {
    return (
        <ReportExcelExtractionTemplate
            title='Collections'
            description='Choose a date range, generate a report, or upload a spreadsheet for extraction.'
            reportSlug='collections'
        />
    );
};

export default CollectionsExcelExtraction;
