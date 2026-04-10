import { supabase } from '@/lib/customSupabaseClient';

export const logActivity = async ({
  userId,
  userEmail,
  userName,
  action,
  module,
  entityType,
  entityId = null,
  entityName = null,
  oldValues = null,
  newValues = null,
  description = null,
}) => {
  try {
    const { error } = await supabase.from('activity_logs').insert([{
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      action,
      module,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      old_values: oldValues,
      new_values: newValues,
      description,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    }]);

    if (error) {
      console.error('Activity log database error:', error.message || error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('Activity log exception:', err.message || err);
    return { success: false, error: err };
  }
};

const extractUserMeta = (user) => {
  if (!user) return { userId: null, userEmail: null, userName: null };
  return {
    userId: user.id || null,
    userEmail: user.email || null,
    userName: user.full_name || user.email || null,
  };
};

export const logLogin = async (user) => {
  const meta = extractUserMeta(user);
  return await logActivity({ ...meta, action: 'LOGIN', module: 'AUTH', entityType: 'SESSION', description: 'User logged in' });
};

export const logLogout = async (user) => {
  const meta = extractUserMeta(user);
  return await logActivity({ ...meta, action: 'LOGOUT', module: 'AUTH', entityType: 'SESSION', description: 'User logged out' });
};

export const logCreate = async (user, module, entityType, entityName, newValues, description) => {
  const meta = extractUserMeta(user);
  return await logActivity({ ...meta, action: 'CREATE', module, entityType, entityName, newValues, description: description || `Created new ${entityType}: ${entityName}` });
};

export const logUpdate = async (user, module, entityType, entityName, oldValues, newValues, description) => {
  const meta = extractUserMeta(user);
  return await logActivity({ ...meta, action: 'UPDATE', module, entityType, entityName, oldValues, newValues, description: description || `Updated ${entityType}: ${entityName}` });
};

export const logDelete = async (user, module, entityType, entityName, oldValues, description) => {
  const meta = extractUserMeta(user);
  return await logActivity({ ...meta, action: 'DELETE', module, entityType, entityName, oldValues, description: description || `Deleted ${entityType}: ${entityName}` });
};

export const logStatusChange = async (user, module, entityType, entityName, oldStatus, newStatus, description) => {
  const meta = extractUserMeta(user);
  return await logActivity({
    ...meta, 
    action: 'STATUS_CHANGE', 
    module, 
    entityType, 
    entityName, 
    oldValues: { status: oldStatus }, 
    newValues: { status: newStatus }, 
    description: description || `Changed ${entityType} status from ${oldStatus} to ${newStatus}` 
  });
};