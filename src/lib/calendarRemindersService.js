import { supabase } from './customSupabaseClient';

/**
 * Fetch projects that are considered paid based on status or amount.
 */
export async function fetchPaidProjects() {
    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select(
                `
        *,
        invoices (*),
        payments (*)
      `
            )
            .eq('is_deleted', false);

        if (error) throw error;

        const paidProjects = (projects || []).filter((p) => {
            if (p.payment_status?.toUpperCase() === 'PAID') return true;
            if (p.invoice_status?.toUpperCase() === 'PAID') return true;

            const totalInv =
                p.invoices?.reduce(
                    (sum, inv) => sum + (Number(inv.total_amount) || 0),
                    0
                ) || 0;
            const totalPaid =
                p.payments?.reduce(
                    (sum, pay) => sum + (Number(pay.amount_paid) || 0),
                    0
                ) || 0;

            if (totalInv > 0 && totalPaid >= totalInv) return true;

            return false;
        });

        return paidProjects;
    } catch (err) {
        console.error('Error fetching paid projects:', err);
        return [];
    }
}

/**
 * Maps paid projects to calendar events.
 */
export async function fetchPaidCalendarEvents() {
    const paidProjects = await fetchPaidProjects();

    return paidProjects.map((p) => {
        // Prefer payment date, fallback to issue date or PO date
        let date = p.po_date || p.created_at;
        if (p.payments && p.payments.length > 0) {
            // Get latest payment date
            const sortedPayments = [...p.payments].sort(
                (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
            );
            date = sortedPayments[0].payment_date;
        }

        return {
            id: p.id,
            date: date.split('T')[0],
            title: `Paid: ${p.project_number || 'Project'}`,
            type: 'paid',
            projectData: p
        };
    });
}

/**
 * Fetch all calendar events (Paid, Overdue, Upcoming, etc.)
 */
export async function fetchAllCalendarEvents() {
    try {
        const paidEvents = await fetchPaidCalendarEvents();

        // Fetch invoices to determine upcoming and overdue
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('*, projects(*)')
            .eq('is_deleted', false);

        if (error) throw error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const invoiceEvents = [];

        (invoices || []).forEach((inv) => {
            // Skip if related project is already considered paid
            if (paidEvents.some((pe) => pe.projectData?.id === inv.project_id))
                return;

            if (inv.due_date) {
                const dueDate = new Date(inv.due_date);
                dueDate.setHours(0, 0, 0, 0);

                const isOverdue = dueDate < today;
                const type = isOverdue ? 'overdue' : 'upcoming';
                const projectNum = inv.projects?.project_number || 'Unknown';

                invoiceEvents.push({
                    id: inv.id,
                    date: inv.due_date.split('T')[0],
                    title: `${isOverdue ? 'Overdue' : 'Due'}: ${inv.invoice_number || projectNum}`,
                    type: type,
                    invoiceData: inv
                });
            }
        });

        return [...paidEvents, ...invoiceEvents];
    } catch (err) {
        console.error('Error fetching all calendar events:', err);
        return [];
    }
}

/**
 * Fetch reminders with optional type filter.
 */
export async function fetchReminders(type = 'all') {
    try {
        let query = supabase
            .from('reminders')
            .select('*')
            .order('date', { ascending: true });

        if (type !== 'all') {
            query = query.eq('reminder_type', type);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error(`Error fetching reminders (${type}):`, err);
        return [];
    }
}

export async function createCustomReminder(reminder) {
    try {
        const { data, error } = await supabase
            .from('reminders')
            .insert([
                {
                    ...reminder,
                    reminder_type: reminder.reminder_type || 'custom'
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error creating custom reminder:', err);
        throw err;
    }
}

export async function updateReminder(id, updates) {
    try {
        const { data, error } = await supabase
            .from('reminders')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error updating reminder:', err);
        throw err;
    }
}

export async function deleteReminder(id) {
    try {
        const { error } = await supabase
            .from('reminders')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error deleting reminder:', err);
        throw err;
    }
}
