import React from 'react';
import ReportExcelExtractionTemplate from './ReportExcelExtractionTemplate';

const ShareProfitExcelExtraction = () => {
  return (
    <ReportExcelExtractionTemplate
      title="Share Profit"
      description="Choose a date range, generate a report, or upload a spreadsheet for extraction."
      reportSlug="share-profit"
    />
  );
};

export default ShareProfitExcelExtraction;
