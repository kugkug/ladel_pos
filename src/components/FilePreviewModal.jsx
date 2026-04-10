import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadFile } from '@/lib/downloadFile';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const FilePreviewModal = ({ file, title, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  if (!file) return null;

  const isImage = file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPdf = file.type === 'application/pdf' || file.name?.match(/\.pdf$/i);
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name?.match(/\.docx?$/i);

  const fileUrl = file instanceof File ? URL.createObjectURL(file) : null;

  const handleDownload = () => {
    downloadFile(file, title || 'document');
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-900 text-white">
          <div>
            <h3 className="font-bold text-lg truncate max-w-md">{file.name || title}</h3>
            <p className="text-xs text-gray-400">
              {file.type || 'Unknown type'} • {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(isPdf || isImage) && (
              <>
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}><ZoomOut className="w-5 h-5"/></Button>
                <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white" onClick={() => setScale(s => Math.min(3, s + 0.2))}><ZoomIn className="w-5 h-5"/></Button>
              </>
            )}
            <Button onClick={handleDownload} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white ml-2"><Download className="w-4 h-4 mr-1"/> Download</Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-300 hover:text-white ml-1"><X className="w-6 h-6"/></Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          {isImage && fileUrl && (
            <img src={fileUrl} alt={title} style={{ transform: `scale(${scale})`, transition: 'transform 0.2s' }} className="max-w-full shadow-lg" />
          )}
          
          {isPdf && fileUrl && (
            <div className="flex flex-col items-center">
              <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} className="shadow-lg">
                <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
              </Document>
              {numPages > 1 && (
                <div className="flex items-center gap-4 mt-4 bg-white px-4 py-2 rounded-full shadow">
                  <Button variant="outline" size="sm" disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)}>Prev</Button>
                  <span className="text-sm font-medium">Page {pageNumber} of {numPages}</span>
                  <Button variant="outline" size="sm" disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}

          {(isDocx || (!isImage && !isPdf)) && (
            <div className="text-center flex flex-col items-center">
              <FileText className="w-24 h-24 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Preview Not Available</h3>
              <p className="text-gray-500 mb-6">This file type cannot be previewed in the browser.</p>
              <Button onClick={handleDownload} className="bg-blue-600 text-white"><Download className="w-4 h-4 mr-2"/> Download to View</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;