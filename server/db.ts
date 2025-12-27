import pg from "pg";
// No database connection for this in-memory project
// Exporting mocks to satisfy any potential imports
export const pool = new pg.Pool({ connectionString: "postgres://mock:mock@localhost:5432/mock" });
export const db = {
  select: () => ({ from: () => [] }),
  insert: () => ({ values: () => ({ returning: () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
  delete: () => ({ where: () => ({ returning: () => [] }) }),
  query: {}
} as any;
