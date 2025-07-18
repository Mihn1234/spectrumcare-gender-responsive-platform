// Minimal database configuration for build
export const db = {
  query: async (sql: string, params?: any[]) => {
    // Placeholder for database queries
    console.log('Database query:', sql, params);
    return { rows: [] };
  }
};

// Export for compatibility
export default db;
