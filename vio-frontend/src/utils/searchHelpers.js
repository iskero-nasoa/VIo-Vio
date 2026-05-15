export function normalizeSearchQuery(query) {
  if (!query) return '';
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\sа-яА-Я]/gi, ''); // Keep alphanumeric and spaces (including Cyrillic)
}

export function validateSearchQuery(query) {
  if (!query || query.trim().length < 2) {
    return { valid: false, error: 'Search query must be at least 2 characters long' };
  }
  if (query.length > 100) {
    return { valid: false, error: 'Search query must be less than 100 characters' };
  }
  return { valid: true };
}

export function filterSearchResults(results, type) {
  if (!results || !Array.isArray(results)) return [];
  
  // Remove duplicates by _id
  const seen = new Set();
  return results.filter(item => {
    const id = item._id || item.id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
