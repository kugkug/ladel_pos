import { format, isBefore, startOfDay } from 'date-fns';

/**
 * Validates if the input is a proper array.
 */
const isArr = (arr) => Array.isArray(arr);

export const getOngoingProjectsWithDR = (projects, purchaseOrders, deliveryReceipts) => {
  if (!isArr(projects) || !isArr(purchaseOrders) || !isArr(deliveryReceipts)) return 0;

  return projects.filter(p => {
    const hasPO = purchaseOrders.some(po => po.projectId === p.id);
    const hasDR = deliveryReceipts.some(dr => dr.projectId === p.id);
    return hasPO && hasDR && p.status !== 'Canceled' && p.status !== 'Paid' && p.status !== 'Completed';
  }).length;
};

export const getUpcomingCollectionsAmount = (invoices, acknowledgementReceipts, projects) => {
  if (!isArr(invoices)) return 0;
  const safeARs = isArr(acknowledgementReceipts) ? acknowledgementReceipts : [];
  const safeProjects = isArr(projects) ? projects : [];

  const today = startOfDay(new Date());
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return invoices.filter(inv => {
    const proj = safeProjects.find(p => p.id === inv.projectId);
    // ONLY for COMPLETED projects
    if (!proj || proj.status !== 'Completed') return false;

    const ar = safeARs.find(a => a.projectId === inv.projectId);
    if (ar && ar.arStatus === 'Paid') return false;

    if (!inv.dueDate) return false;
    const dueDate = new Date(inv.dueDate);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  }).reduce((sum, inv) => sum + (Number(inv.grossAmount) || 0), 0);
};

export const getUpcomingCollectionsCount = (invoices, acknowledgementReceipts, projects) => {
  if (!isArr(invoices)) return 0;
  const safeARs = isArr(acknowledgementReceipts) ? acknowledgementReceipts : [];
  const safeProjects = isArr(projects) ? projects : [];

  const today = startOfDay(new Date());
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return invoices.filter(inv => {
    const proj = safeProjects.find(p => p.id === inv.projectId);
    if (!proj || proj.status !== 'Completed') return false;

    const ar = safeARs.find(a => a.projectId === inv.projectId);
    if (ar && ar.arStatus === 'Paid') return false;

    if (!inv.dueDate) return false;
    const dueDate = new Date(inv.dueDate);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  }).length;
};

export const getOverdueProjectsWithoutCompletedAR = (invoices, acknowledgementReceipts) => {
  if (!isArr(invoices)) return [];
  const safeARs = isArr(acknowledgementReceipts) ? acknowledgementReceipts : [];

  const today = startOfDay(new Date());

  return invoices.filter(inv => {
    const ar = safeARs.find(a => a.projectId === inv.projectId);
    if (!inv.dueDate) return false;
    
    const dueDate = startOfDay(new Date(inv.dueDate));
    
    // If AR status = Paid: Exclude
    if (ar && ar.arStatus === 'Paid') return false;
    
    // If AR status = Not Paid or No AR record: Include if past due
    return isBefore(dueDate, today);
  });
};