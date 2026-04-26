import React from 'react';
import ReportExcelExtractionTemplate from './ReportExcelExtractionTemplate';

const CollectedExcelExtraction = () => {
  return (
    <ReportExcelExtractionTemplate
      title="Collected"
      description="Choose a date range, generate a report, or upload a spreadsheet for extraction."
      reportSlug="collected"
    />
  );
};

export default CollectedExcelExtraction;
