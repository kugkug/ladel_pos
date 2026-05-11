import { supabase } from '@/lib/customSupabaseClient';

let cachedOwnerColumn = null;

/**
 * Detects the owner column dynamically from the schema priority list
 */
export const detectOwnerColumn = async () => {
    if (cachedOwnerColumn) return cachedOwnerColumn;

    try {
        const { data, error } = await supabase
            .from('quotations')
            .select('*')
            .limit(1);
        if (error) throw error;

        const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
        const potentialCols = ['created_by', 'user_id', 'owner_id', 'owner'];

        for (const col of potentialCols) {
            if (columns.includes(col)) {
                cachedOwnerColumn = col;
                return col;
            }
        }

        // Fallback if table is empty but we know we added owner_id via migration
        cachedOwnerColumn = 'owner_id';
        return cachedOwnerColumn;
    } catch (error) {
        console.warn(
            'Could not dynamically detect owner column, falling back to owner_id',
            error
        );
        return 'owner_id';
    }
};

/**
 * Creates a new quotation ensuring the owner is set.
 * Excludes generated columns: vat_amount, gross_amount.
 * @param {Object} data - The quotation data to insert.
 * @returns {Promise<Object>} The created quotation with auto-calculated fields.
 */
export const createQuotation = async (data) => {
    try {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated.');

        const ownerCol = await detectOwnerColumn();
        const { vat_amount, gross_amount, ...payload } = data;

        const payloadWithOwner = {
            ...payload,
            [ownerCol]: user.id
        };

        const { data: newQuotation, error } = await supabase
            .from('quotations')
            .insert([payloadWithOwner])
            .select()
            .single();

        if (error) throw error;
        return newQuotation;
    } catch (err) {
        console.error('Service: Error creating quotation:', err);
        throw err;
    }
};

/**
 * Fetches only the current user's quotations.
 * @returns {Promise<Array>} List of quotations.
 */
export const fetchUserQuotations = async () => {
    try {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated.');

        const ownerCol = await detectOwnerColumn();

        const { data, error } = await supabase
            .from('quotations')
            .select('*')
            .eq(ownerCol, user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Service: Error fetching user quotations:', err);
        throw err;
    }
};

/**
 * Updates an existing quotation validating ownership.
 * Excludes generated columns.
 * @param {string} id - The ID of the quotation to update.
 * @param {Object} data - The updated data.
 * @returns {Promise<Object>} The updated quotation.
 */
export const updateQuotation = async (id, data) => {
    try {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated.');

        const ownerCol = await detectOwnerColumn();
        const { vat_amount, gross_amount, ...payload } = data;
        console.log(vat_amount, gross_amount, payload);
        const { data: updatedQuotation, error } = await supabase
            .from('quotations')
            .update(payload)
            .eq('id', id)
            .eq(ownerCol, user.id)
            .select()
            .single();

        if (error) throw error;
        return updatedQuotation;
    } catch (err) {
        console.error('Service: Error updating quotation:', err);
        throw err;
    }
};

/**
 * Deletes a quotation ensuring ownership.
 * @param {string} id - The ID of the quotation to delete.
 * @returns {Promise<boolean>} Success status.
 */
export const deleteQuotation = async (id) => {
    try {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated.');

        const ownerCol = await detectOwnerColumn();

        const { error } = await supabase
            .from('quotations')
            .delete()
            .eq('id', id)
            .eq(ownerCol, user.id);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Service: Error deleting quotation:', err);
        throw err;
    }
};
