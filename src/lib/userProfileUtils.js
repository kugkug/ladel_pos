import { supabase } from '@/lib/customSupabaseClient';

export const fetchUserProfiles = async () => {
  try {
    const { data, error } = await supabase.from('users').select('id, email, full_name');
    if (error) throw error;
    
    const profileMap = new Map();
    if (data) {
      data.forEach(user => profileMap.set(user.id, user));
    }
    return profileMap;
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return new Map();
  }
};

export const mapUserIdToName = (userId, userProfiles) => {
  if (!userId) return null;
  if (!userProfiles) return userId;
  const profile = userProfiles.get(userId);
  return profile?.full_name || profile?.email || userId;
};