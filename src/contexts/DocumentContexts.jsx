import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { logCreate, logUpdate, logDelete } from '@/lib/ActivityLogger';

const createDocumentContext = (tableName, documentName) => {
  const Context = createContext();
  const Provider = ({ children }) => {
    const { currentUser } = useAuth();
    const { toast } = useToast();
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDocuments = useCallback(async (projectId) => {
      setIsLoading(true);
      try {
        let query = supabase.from(tableName).select('*');
        if (projectId) query = query.eq('project_id', projectId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setDocuments(data);
        return data;
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        toast({ title: 'Error', description: `Failed to load ${documentName}s`, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }, [toast]);

    const addDocument = async (data) => {
      try {
        const payload = { ...data };
        // Defensive coding: vat_amount, total_amount, gross_amount are GENERATED columns - do NOT include
        delete payload.vat_amount;
        delete payload.total_amount;
        delete payload.gross_amount;

        const { data: newDoc, error } = await supabase.from(tableName).insert([payload]).select().single();
        if (error) throw error;
        setDocuments(prev => [newDoc, ...prev]);
        if (currentUser) logCreate(currentUser, 'SALES', documentName.toUpperCase(), newDoc.id, newDoc);
        toast({ title: 'Success', description: `${documentName} created successfully.` });
        return newDoc;
      } catch (error) {
        console.error(`Error adding ${tableName}:`, error);
        toast({ title: 'Error', description: error.message || `Failed to create ${documentName}`, variant: 'destructive' });
        throw error;
      }
    };

    const editDocument = async (id, data) => {
      try {
        const oldDoc = documents.find(d => d.id === id);
        const payload = { ...data };
        // Defensive coding: vat_amount, total_amount, gross_amount are GENERATED columns - do NOT include
        delete payload.vat_amount;
        delete payload.total_amount;
        delete payload.gross_amount;

        const { data: updatedDoc, error } = await supabase.from(tableName).update(payload).eq('id', id).select().single();
        if (error) throw error;
        setDocuments(prev => prev.map(d => d.id === id ? updatedDoc : d));
        if (currentUser) logUpdate(currentUser, 'SALES', documentName.toUpperCase(), id, oldDoc, updatedDoc);
        toast({ title: 'Success', description: `${documentName} updated successfully.` });
        return updatedDoc;
      } catch (error) {
        console.error(`Error updating ${tableName}:`, error);
        toast({ title: 'Error', description: error.message || `Failed to update ${documentName}`, variant: 'destructive' });
        throw error;
      }
    };

    const deleteDocument = async (id) => {
      try {
        const doc = documents.find(d => d.id === id);
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
        setDocuments(prev => prev.filter(d => d.id !== id));
        if (currentUser) logDelete(currentUser, 'SALES', documentName.toUpperCase(), id, doc);
        toast({ title: 'Success', description: `${documentName} deleted successfully.` });
      } catch (error) {
        console.error(`Error deleting ${tableName}:`, error);
        toast({ title: 'Error', description: error.message || `Failed to delete ${documentName}`, variant: 'destructive' });
        throw error;
      }
    };

    const updateStatus = async (id, status) => {
      return await editDocument(id, { status });
    };

    return (
      <Context.Provider value={{ documents, isLoading, fetchDocuments, addDocument, editDocument, deleteDocument, updateStatus }}>
        {children}
      </Context.Provider>
    );
  };
  return { Context, Provider };
};

export const { Context: QuotationContext, Provider: QuotationProvider } = createDocumentContext('quotations', 'Quotation');
export const { Context: PurchaseOrderContext, Provider: PurchaseOrderProvider } = createDocumentContext('purchase_orders', 'Purchase Order');
export const { Context: DeliveryReceiptContext, Provider: DeliveryReceiptProvider } = createDocumentContext('delivery_receipts', 'Delivery Receipt');
export const { Context: InvoiceContext, Provider: InvoiceProvider } = createDocumentContext('invoices', 'Invoice');
export const { Context: AcknowledgementReceiptContext, Provider: AcknowledgementReceiptProvider } = createDocumentContext('acknowledgement_receipts', 'Acknowledgement Receipt');