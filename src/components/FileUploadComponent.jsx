import React, { useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

const FileUploadComponent = ({ onFileSelect, existingFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileInfo, setFileInfo] = useState(existingFile || null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Mocking file upload by storing reference metadata
    const info = { name: file.name, size: (file.size / 1024).toFixed(2) + ' KB', type: file.type };
    setFileInfo(info);
    onFileSelect(info);
  };

  const clearFile = () => {
    setFileInfo(null);
    onFileSelect(null);
  };

  if (fileInfo) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-blue-100 rounded text-blue-600"><File className="w-5 h-5"/></div>
          <div className="truncate">
            <p className="text-sm font-medium text-gray-900 truncate">{fileInfo.name}</p>
            <p className="text-xs text-gray-500">{fileInfo.size}</p>
          </div>
        </div>
        <button type="button" onClick={clearFile} className="p-1 hover:bg-blue-100 rounded text-gray-500 hover:text-red-500"><X className="w-4 h-4"/></button>
      </div>
    );
  }

  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}
      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} accept=".pdf,.jpg,.png,.docx" />
      <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p className="text-sm text-gray-600 font-medium">Click or drag file to this area to upload</p>
      <p className="text-xs text-gray-500 mt-1">Supports PDF, JPG, PNG, DOCX</p>
    </div>
  );
};

export default FileUploadComponent;