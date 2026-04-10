export const generateFilename = (prefix) => {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}_${date}.csv`;
};

export const exportToCSV = (data, filename, headers) => {
  if (!data || !data.length) return;

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value);
    // If the value contains quotes, commas, or newlines, escape it
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return `"${stringValue}"`;
  };

  const csvRows = [];
  
  // Add headers
  if (headers && headers.length) {
    csvRows.push(headers.map(escapeCSV).join(','));
  }

  // Add data rows
  data.forEach(row => {
    const csvRow = row.map(escapeCSV).join(',');
    csvRows.push(csvRow);
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};