export const handlePGRST116 = (error) => {
  if (error && error.code === 'PGRST116') {
    return null;
  }
  throw error;
};

export const fetchSingleOrNull = async (query) => {
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  
  return data;
};