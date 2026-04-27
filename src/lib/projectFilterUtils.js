import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    isWithinInterval,
    parseISO
} from 'date-fns';

/* ==========================================================================
   FIELD MAPPING DOCUMENTATION (Synchronized with dashboardDataUtils.js)
   ==========================================================================
   Standard Field Resolutions:
   
   Pending Quotations:
   - Status field: project.quotation?.quotation_status OR project.quotation?.status (Must exactly match 'Pending')
   - Amount field: project.quotation?.gross_amount OR project.quotation?.total_amount OR project.quotation?.amount
   - Date field: project.quotation?.created_at
   - Deletion check: project.quotation?.is_deleted = false
   
   Ongoing Projects:
   - PO Status field: project.po_type / purchase_orders.status (Must match 'Issued')
   - DR Status field: project.delivery_status / delivery_receipts.dr_status (Exclude if 'Complete')
   - Date field: project.created_at
   - Company field: project.company_name or project.companyName
   ========================================================================== */

export const getCompanyName = (project) => {
    if (!project) return 'Unknown';
    return (
        project.companyName ||
        project.company_name ||
        project.client_name ||
        project.client ||
        project.company ||
        'Unknown'
    );
};

export const getDateField = (project) => {
    if (!project) return null;
    return (
        project.created_at || project.date_created || project.createdOn || null
    );
};

export const getSearchableFields = (project) => {
    if (!project) return [];
    const fields = [
        project.pr_number,
        project.prNo,
        project.project_number,
        project.project_title,
        project.qt_number,
        project.quotation_number,
        project.quotation?.quotation_number,
        project.po_number,
        project.customer_po_number,
        project.temporary_po_code,
        project.dr_number,
        project.inv_number,
        project.invoice_number,
        project.ar_number,
        getCompanyName(project)
    ];
    return fields.filter(Boolean).map(String);
};

const getSearchableFieldValuesByKey = (project, searchField = 'all') => {
    if (!project) return [];

    const fieldMap = {
        project_number: [
            project.pr_number,
            project.prNo,
            project.project_number
        ],
        quotation_number: [
            project.qt_number,
            project.quotation_number,
            project.quotation?.quotation_number
        ],
        purchase_order: [
            project.po_number,
            project.customer_po_number,
            project.temporary_po_code,
            project.purchase_order
        ],
        invoice_number: [project.inv_number, project.invoice_number],
        dr_number: [project.dr_number]
    };

    if (searchField === 'all') {
        return Object.values(fieldMap).flat().filter(Boolean).map(String);
    }

    return (fieldMap[searchField] || []).filter(Boolean).map(String);
};

export const matchesSearch = (project, searchTerm, searchField = 'all') => {
    if (!searchTerm || !searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const searchableFields =
        searchField === 'all'
            ? getSearchableFieldValuesByKey(project, 'all')
            : getSearchableFieldValuesByKey(project, searchField);
    return searchableFields.some((field) => field.toLowerCase().includes(term));
};

export const matchesCompany = (project, selectedCompany) => {
    if (!selectedCompany || selectedCompany === 'All') return true;
    const companyName = getCompanyName(project);
    return companyName.toLowerCase() === selectedCompany.toLowerCase();
};

export const matchesDateRange = (project, startDate, endDate) => {
    if (!startDate && !endDate) return true;

    const dateStr = getDateField(project);
    if (!dateStr) return false;

    try {
        const projectDate = parseISO(dateStr);

        if (startDate && endDate) {
            return isWithinInterval(projectDate, {
                start: startOfDay(new Date(startDate)),
                end: endOfDay(new Date(endDate))
            });
        } else if (startDate) {
            return projectDate >= startOfDay(new Date(startDate));
        } else if (endDate) {
            return projectDate <= endOfDay(new Date(endDate));
        }
    } catch (error) {
        console.warn('Error parsing date for project:', project, error);
        return false;
    }

    return true;
};

export const getDateRangeFromPreset = (preset, currentDate = new Date()) => {
    switch (preset) {
        case 'Today':
            return {
                start: startOfDay(currentDate),
                end: endOfDay(currentDate)
            };
        case 'This Week':
            return {
                start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                end: endOfWeek(currentDate, { weekStartsOn: 1 })
            };
        case 'This Month':
            return {
                start: startOfMonth(currentDate),
                end: endOfMonth(currentDate)
            };
        case 'This Year':
            return {
                start: startOfYear(currentDate),
                end: endOfYear(currentDate)
            };
        default:
            return { start: null, end: null };
    }
};

export const applyAllFilters = (projects, filters) => {
    if (!projects || !Array.isArray(projects)) return [];

    return projects.filter((project) => {
        // Basic deletion check
        if (project.is_deleted) return false;

        // 1. Search filter
        if (
            !matchesSearch(
                project,
                filters.search,
                filters.searchField || 'all'
            )
        )
            return false;

        // 2. Company filter
        if (!matchesCompany(project, filters.company)) return false;

        // 3. Date filter
        const { start, end } = filters.datePreset
            ? getDateRangeFromPreset(filters.datePreset)
            : filters.dateRange;

        if ((start || end) && !matchesDateRange(project, start, end))
            return false;

        return true;
    });
};
