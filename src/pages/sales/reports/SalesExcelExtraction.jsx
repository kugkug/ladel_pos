import React, { useCallback } from 'react';
import ExcelJS from 'exceljs';
import ReportExcelExtractionTemplate from './ReportExcelExtractionTemplate';
import { supabase } from '@/lib/customSupabaseClient';

const SALES_EXCEL_HEADERS = [
    'Customer Name / Supplier',
    'Project No.',
    'Order Description'
];

export async function generateSalesExcelExtraction(options = {}) {
    const fetchSalesRows = async ({ dateFrom, dateTo } = {}) => {
        let query = supabase
            .from('projects')
            .select(
                `
                id,
                project_number,
                project_title,
                po_type,
                companies (company_name)
            `
            )
            .gte('po_created_at', dateFrom)
            .lte('po_created_at', dateTo)
            .eq('is_deleted', false);

        const { data, error } = await query;
        if (error) {
            throw error;
        }

        // Map to flat rows for the Excel extraction
        return (data || []).map((proj) => ({
            customerName: proj.companies?.company_name || '',
            projectNo: proj.project_number || '',
            orderDescription: proj.project_title || ''
        }));
    };

    const rows = await fetchSalesRows({
        dateFrom: options.dateFrom,
        dateTo: options.dateTo
    });

    const filename = `sales-extraction-${options.dateFrom}-${options.dateTo}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Situation');

    worksheet.mergeCells('A1:I1');

    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'SALES SITUATION';
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5CC27' }
    };
    titleCell.border = {
        top: { style: 'thin', color: { argb: '00000000' } },
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } }
    };

    titleCell.font = { bold: true, size: 20 };

    worksheet.addRow(SALES_EXCEL_HEADERS);
    worksheet.mergeCells('A2:A3');
    worksheet.mergeCells('B2:B3');
    worksheet.mergeCells('C2:C3');

    const customerCell = worksheet.getCell('A2');
    customerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    customerCell.border = {
        top: { style: 'thin', color: { argb: '00000000' } },
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } }
    };
    customerCell.font = { bold: true };

    const projectNoCell = worksheet.getCell('B2');
    projectNoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    projectNoCell.border = {
        top: { style: 'thin', color: { argb: '00000000' } },
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } }
    };
    projectNoCell.font = { bold: true };

    const orderDescriptionCell = worksheet.getCell('C2');
    orderDescriptionCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
    };
    orderDescriptionCell.border = {
        top: { style: 'thin', color: { argb: '00000000' } },
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } }
    };

    orderDescriptionCell.font = { bold: true };

    let rowStart = 4;

    rows.forEach((row) => {
        worksheet.addRow([
            row.customerName ?? '',
            row.projectNo ?? '',
            row.orderDescription ?? ''
        ]);

        const customerNameCell = worksheet.getCell('A' + rowStart);
        customerNameCell.border = {
            top: { style: 'thin', color: { argb: '00000000' } },
            bottom: { style: 'thin', color: { argb: '00000000' } },
            left: { style: 'thin', color: { argb: '00000000' } },
            right: { style: 'thin', color: { argb: '00000000' } }
        };

        const projectNoCell = worksheet.getCell('B' + rowStart);
        projectNoCell.border = {
            top: { style: 'thin', color: { argb: '00000000' } },
            bottom: { style: 'thin', color: { argb: '00000000' } },
            left: { style: 'thin', color: { argb: '00000000' } },
            right: { style: 'thin', color: { argb: '00000000' } }
        };
        projectNoCell.alignment = { horizontal: 'center', vertical: 'middle' };

        const orderDescriptionCell = worksheet.getCell('C' + rowStart);
        orderDescriptionCell.border = {
            top: { style: 'thin', color: { argb: '00000000' } },
            bottom: { style: 'thin', color: { argb: '00000000' } },
            left: { style: 'thin', color: { argb: '00000000' } },
            right: { style: 'thin', color: { argb: '00000000' } }
        };

        rowStart++;
        customerNameCell.font = { size: 12 };
    });

    worksheet.columns = [{ width: 25 }, { width: 18 }, { width: 50 }];
    // worksheet.columns = { wrapText: true };

    const headerRow = worksheet.getRow(2);
    headerRow.font = { bold: true };

    worksheet.mergeCells('A' + rowStart + ':C' + rowStart);
    const footerCell = worksheet.getCell('A' + rowStart);
    footerCell.value = 'GRAND TOTAL';
    footerCell.font = { bold: true };
    footerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '02ED3A' }
    };
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    footerCell.border = {
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

const SalesExcelExtraction = () => {
    const onGenerateReport = useCallback(async ({ dateFrom, dateTo }) => {
        generateSalesExcelExtraction({
            dateFrom: dateFrom,
            dateTo: dateTo
        });
    }, []);

    return (
        <ReportExcelExtractionTemplate
            title='Sales'
            description='Choose a date range, generate a report, or upload a spreadsheet for extraction.'
            reportSlug='sales'
            onGenerateReport={onGenerateReport}
        />
    );
};

export default SalesExcelExtraction;
