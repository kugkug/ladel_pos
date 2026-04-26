import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logCreate, logUpdate, logDelete } from '@/lib/ActivityLogger';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, company:companies(*), contact:company_contacts(*), quotations!projects_quotation_id_fkey(*)`)
        .or('is_deleted.eq.false,is_deleted.is.null')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const orphaned = data.filter(p => p.quotation_id && !p.quotations);
      if (orphaned.length > 0) {
        console.warn('Data Integrity Warning: Projects with orphaned quotation_id:', orphaned.map(p => p.project_number));
      }

      const formatted = data.map(p => {
        const qt = p.quotations;
        let normalizedQt = Array.isArray(qt) ? qt[0] : qt;
        if (normalizedQt?.is_deleted) normalizedQt = null;
        
        return {
          ...p,
          pr_number: p.project_number,
          companyName: p.company?.company_name || 'Unknown Company',
          company_name: p.company?.company_name,
          contact_name: p.contact?.contact_name,
          quotation: normalizedQt || null
        };
      });
      
      setProjects(formatted);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({ title: "Error", description: "Failed to load projects.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const verifyPassword = async (password) => {
    if (!currentUser?.email) throw new Error("No authenticated user.");
    const { error } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: password,
    });
    if (error) throw new Error("Invalid password");
    return true;
  };

  const createProject = async (projectData, quotationData) => {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      const safeCompanyId = projectData.company_id || projectData.companyId;
      const safeContactId = projectData.contact_id || projectData.contactId;
      const prNumber = projectData.pr_number || projectData.prNumber || projectData.prNo || projectData.pr_id || projectData.projectNumber || projectData.project_number;
      const projectTitle = projectData.project_title || projectData.projectTitle;

      if (!safeCompanyId || !uuidRegex.test(safeCompanyId)) throw new Error("Company is required and must be a valid UUID.");
      if (!safeContactId || !uuidRegex.test(safeContactId)) throw new Error("Contact is required and must be a valid UUID.");
      if (!prNumber?.trim()) throw new Error("PR Number is required.");
      if (!projectTitle?.trim()) throw new Error("Project title is required.");

      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('id')
        .eq('project_number', prNumber.trim())
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingProject) throw new Error(`PR number "${prNumber.trim()}" already exists in the database.`);

      const payload = {
        project_number: prNumber.trim(),
        project_title: projectTitle.trim(),
        company_id: safeCompanyId,
        contact_id: safeContactId
      };
      
      const { data: projData, error: projError } = await supabase.from('projects').insert([payload]).select().single();
      if (projError) throw projError;
      
      if (quotationData && quotationData.quotationNumber?.trim()) {
        const qtPayload = {
          quotation_number: quotationData.quotationNumber.trim(),
          quotation_status: quotationData.quotationStatus || 'Pending',
          status: 'Draft'
        };
        
        if (quotationData.dateIssued) qtPayload.date_issued = quotationData.dateIssued;
        if (quotationData.orderDescription) qtPayload.order_description = quotationData.orderDescription.trim();
        if (quotationData.netAmount ?? quotationData.net_amount) {
          qtPayload.net_amount = parseFloat(
            quotationData.netAmount ?? quotationData.net_amount
          );
        }
        if (quotationData.grossAmount ?? quotationData.gross_amount) {
          qtPayload.gross_amount = parseFloat(
            quotationData.grossAmount ?? quotationData.gross_amount
          );
        }
        if (quotationData.taxType) qtPayload.tax_type = quotationData.taxType;

        const { data: qtData, error: qtError } = await supabase.from('quotations').insert([qtPayload]).select().single();
        if (qtError) {
          await supabase.from('projects').delete().eq('id', projData.id);
          throw qtError;
        }

        const { error: updateError } = await supabase.from('projects').update({ quotation_id: qtData.id }).eq('id', projData.id);
        if (updateError) throw updateError;
        
        if (currentUser) logCreate(currentUser, 'SALES', 'QUOTATION', qtData.quotation_number, qtData);
      }
      
      await fetchProjects();
      if (currentUser) logCreate(currentUser, 'SALES', 'PROJECT', projData.project_number, projData);
      
      return projData;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  const updateProject = async (id, data) => {
    try {
      const payload = { ...data };
      if (data.pr_number) {
        payload.project_number = data.pr_number;
        delete payload.pr_number;
      }
      
      const oldProject = projects.find(p => p.id === id);
      const { data: updated, error } = await supabase.from('projects').update(payload).eq('id', id).select().single();
      if (error) throw error;
      
      await fetchProjects();
      if (currentUser && oldProject) logUpdate(currentUser, 'SALES', 'PROJECT', updated.project_number, oldProject, updated);
      return updated;
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to update project.", variant: "destructive" });
      throw err;
    }
  };

  const deleteProject = async (projectId, password) => {
    try {
      await verifyPassword(password);
      
      const projectToDelete = projects.find(p => p.id === projectId);
      const deletedAt = new Date().toISOString();
      
      const softDeletePayload = { is_deleted: true, deleted_at: deletedAt, deleted_by: currentUser.id };

      // Soft delete related docs
      await supabase.from('purchase_orders').update(softDeletePayload).eq('project_id', projectId);
      await supabase.from('delivery_receipts').update(softDeletePayload).eq('project_id', projectId);
      await supabase.from('invoices').update(softDeletePayload).eq('project_id', projectId);
      await supabase.from('payments').update(softDeletePayload).eq('project_id', projectId);
      await supabase.from('acknowledgement_receipts').update(softDeletePayload).eq('project_id', projectId);
      
      if (projectToDelete?.quotation_id) {
        await supabase.from('quotations').update(softDeletePayload).eq('id', projectToDelete.quotation_id);
      }

      // Soft delete project
      const { error } = await supabase.from('projects').update(softDeletePayload).eq('id', projectId);
      if (error) throw error;

      await fetchProjects();
      if (currentUser) logDelete(currentUser, 'SALES', 'PROJECT', projectToDelete?.project_number, projectToDelete);
      
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const restoreProject = async (projectId) => {
    try {
      // Get project to find quotation_id
      const { data: project } = await supabase.from('projects').select('quotation_id').eq('id', projectId).single();
      
      const restorePayload = { is_deleted: false, deleted_at: null, deleted_by: null };

      // Restore related docs
      await supabase.from('purchase_orders').update(restorePayload).eq('project_id', projectId);
      await supabase.from('delivery_receipts').update(restorePayload).eq('project_id', projectId);
      await supabase.from('invoices').update(restorePayload).eq('project_id', projectId);
      await supabase.from('payments').update(restorePayload).eq('project_id', projectId);
      await supabase.from('acknowledgement_receipts').update(restorePayload).eq('project_id', projectId);
      
      if (project?.quotation_id) {
        await supabase.from('quotations').update(restorePayload).eq('id', project.quotation_id);
      }

      // Restore project
      const { error } = await supabase.from('projects').update(restorePayload).eq('id', projectId);
      if (error) throw error;

      await fetchProjects();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const permanentlyDeleteProject = async (projectId, password) => {
    try {
      await verifyPassword(password);
      
      const { data: project } = await supabase.from('projects').select('quotation_id').eq('id', projectId).single();

      // Delete related docs permanently
      await supabase.from('purchase_orders').delete().eq('project_id', projectId);
      await supabase.from('delivery_receipts').delete().eq('project_id', projectId);
      await supabase.from('invoices').delete().eq('project_id', projectId);
      await supabase.from('payments').delete().eq('project_id', projectId);
      await supabase.from('acknowledgement_receipts').delete().eq('project_id', projectId);

      // Nullify quotation_id before deleting project if we want to delete quote
      await supabase.from('projects').update({ quotation_id: null }).eq('id', projectId);
      
      if (project?.quotation_id) {
        await supabase.from('quotations').delete().eq('id', project.quotation_id);
      }

      // Delete project permanently
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;

      await fetchProjects();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const getProjectWithAllDocuments = async (projectId) => {
    const [
      { data: project },
      { data: deliveryReceipts },
      { data: invoices },
      { data: payments },
      { data: acknowledgementReceipts }
    ] = await Promise.all([
      supabase.from('projects').select('*, company:companies(*), contact:company_contacts(*), quotations!projects_quotation_id_fkey(*)').eq('id', projectId).single(),
      supabase.from('delivery_receipts').select('*').eq('project_id', projectId).eq('is_deleted', false).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('project_id', projectId).eq('is_deleted', false).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('project_id', projectId).eq('is_deleted', false).order('created_at', { ascending: false }),
      supabase.from('acknowledgement_receipts').select('*').eq('project_id', projectId).or('is_deleted.eq.false,is_deleted.is.null').order('created_at', { ascending: false })
    ]);

    if (project) {
      project.pr_number = project.project_number;
    }

    const qt = project?.quotations;
    let normalizedQt = Array.isArray(qt) ? qt[0] : qt;
    if (normalizedQt?.is_deleted) normalizedQt = null;
    const quotations = normalizedQt ? [normalizedQt] : [];

    return { project, quotations, deliveryReceipts, invoices, payments, acknowledgementReceipts };
  };

  const deleteAcknowledgementReceipt = async (id) => {
    try {
      const { data: ar } = await supabase.from('acknowledgement_receipts').select('*').eq('id', id).single();
      const { error } = await supabase.from('acknowledgement_receipts').update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: currentUser?.id
      }).eq('id', id);

      if (error) throw error;
      
      if (currentUser && ar) {
        logDelete(currentUser, 'SALES', 'ACKNOWLEDGEMENT_RECEIPT', ar.ar_number, ar);
      }
      
      toast({ title: "Success", description: `AR '${ar?.ar_number}' moved to Trash` });
      return true;
    } catch (error) {
      console.error("Error soft-deleting AR:", error);
      toast({ title: "Error", description: "Failed to delete Acknowledgement Receipt.", variant: "destructive" });
      throw error;
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects, isLoading, fetchProjects,
      createProject, updateProject, deleteProject, restoreProject, permanentlyDeleteProject, getProjectWithAllDocuments,
      deleteAcknowledgementReceipt
    }}>
      {children}
    </ProjectContext.Provider>
  );
};