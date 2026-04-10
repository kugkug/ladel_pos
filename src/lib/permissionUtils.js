export const DEFAULT_MODULE_PERMISSIONS = {
  sales: {
    dashboard: 'view',
    data_entry: 'none',
    projects: 'none',
    customers: 'none',
    calendar: 'none'
  },
  expenses: {
    dashboard: 'view',
    data_entry: 'none',
    expenses_list: 'none',
    suppliers: 'none',
    calendar: 'none'
  },
  reports: {
    generate: 'none',
    export: 'none'
  }
};

export const hasModuleAccess = (permissions, moduleName) => {
  if (!permissions || !permissions[moduleName]) return false;
  
  // Check if any sub-permission is greater than 'none'
  const modulePerms = permissions[moduleName];
  return Object.values(modulePerms).some(level => level !== 'none');
};

export const getPermissionLevel = (permissions, moduleName, subSection) => {
  if (!permissions || !permissions[moduleName]) return 'none';
  return permissions[moduleName][subSection] || 'none';
};

export const validatePermissionLevel = (level) => {
  const validLevels = ['none', 'view', 'edit', 'full'];
  return validLevels.includes(level) ? level : 'none';
};