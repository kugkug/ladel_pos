import React, { useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { X, Download, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const DocumentPreviewPanel = () => {
  const { previewDocument, setPreviewDocument, formatCurrency } = useContext(ProjectContext);

  if (!previewDocument) return null;

  const { type, data } = previewDocument;

  const handleClose = () => setPreviewDocument(null);
  const handleAction = (action) => toast({ title: "Action", description: `${action} successfully triggered.` });

  const renderContent = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-accent mb-2">No {type} Found</h3>
          <p className="text-muted-foreground mb-6">This document has not been created yet.</p>
        </div>
      );
    }

    const renderDetails = (doc) => {
      const docNum = doc.quotationNumber || doc.poNumber || doc.drNumber || doc.invoiceNumber || doc.arNumber || 'N/A';
      const amt = doc.grossAmount || doc.amount || doc.netAmount;
      const status = doc.drStatus || doc.invoiceStatus || doc.arStatus || 'Active';
      return (
        <div className="flex items-center justify-between p-4 bg-white border border-muted rounded-xl shadow-sm mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{type}</span>
            <span className="font-bold text-accent text-lg">{docNum}</span>
            <span className="text-sm text-muted-foreground">{doc.dateIssued || doc.date || 'No date'}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold mb-2 ${status.includes('Paid') || status.includes('Completed') ? 'bg-green-100 text-green-700' : 'bg-secondary/20 text-accent'}`}>{status}</span>
            {amt && <span className="font-bold text-primary">{formatCurrency(amt)}</span>}
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => handleAction('Download')} className="border-muted text-accent hover:bg-secondary/20 h-8">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAction('Delete')} className="border-destructive/20 text-destructive hover:bg-destructive/10 h-8">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      );
    };

    if (Array.isArray(data)) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-accent">{data.length} {type}(s) Found</h3>
          </div>
          {data.map((item, idx) => <div key={idx}>{renderDetails(item)}</div>)}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {renderDetails(data)}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm flex justify-end"
        onClick={handleClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-muted/10 h-full shadow-2xl flex flex-col z-50 overflow-hidden border-l border-muted"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-muted flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-accent">{type} List</h2>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-muted-foreground hover:bg-muted rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DocumentPreviewPanel;