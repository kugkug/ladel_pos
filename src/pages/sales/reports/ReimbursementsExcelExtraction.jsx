import React from 'react';
import ReportExcelExtractionTemplate from './ReportExcelExtractionTemplate';

const ReimbursementsExcelExtraction = () => {
    return (
        <ReportExcelExtractionTemplate
            title='Reimbursements'
            description='Choose a date range, generate a report, or upload a spreadsheet for extraction.'
            reportSlug='reimbursements'
        />
    );
};

export default ReimbursementsExcelExtraction;
