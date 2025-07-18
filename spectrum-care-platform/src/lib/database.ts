// Production PostgreSQL Database Connection with Multi-tenant Support
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { z } from 'zod';

// Database configuration schema
const dbConfigSchema = z.object({
  host: z.string(),
  port: z.number().default(5432),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().default(true),
  poolSize: z.number().default(20),
  idleTimeoutMillis: z.number().default(30000),
  connectionTimeoutMillis: z.number().default(10000)
});

type DbConfig = z.infer<typeof dbConfigSchema>;

// Multi-tenant database interface
export class Database {
  private static instance: Database;
  private pool: Pool;
  private isConnected: boolean = false;

  private constructor() {
    const config: DbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'spectrum_care',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production',
      poolSize: parseInt(process.env.DB_POOL_SIZE || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000')
    };

    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: config.poolSize,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
      application_name: 'SpectrumCare-Enterprise'
    });

    // Connection error handling
    this.pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
      this.isConnected = false;
    });

    this.pool.on('connect', () => {
      this.isConnected = true;
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Execute query with tenant isolation
  public async query<T extends QueryResultRow = any>(
    sql: string,
    params: any[] = [],
    tenantId?: string
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();

    try {
      // Set tenant context for row-level security
      if (tenantId) {
        await client.query('SET app.current_tenant_id = $1', [tenantId]);
      }

      const result = await client.query<T>(sql, params);
      return result;
    } finally {
      // Clear tenant context
      if (tenantId) {
        await client.query('RESET app.current_tenant_id');
      }
      client.release();
    }
  }

  // Transaction support with tenant isolation
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    tenantId?: string
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Set tenant context
      if (tenantId) {
        await client.query('SET app.current_tenant_id = $1', [tenantId]);
      }

      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Clear tenant context
      if (tenantId) {
        await client.query('RESET app.current_tenant_id');
      }
      client.release();
    }
  }

  // Health check
  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const result = await this.query('SELECT NOW() as timestamp, version() as version');
      return {
        status: 'healthy',
        details: {
          connected: this.isConnected,
          timestamp: result.rows[0]?.timestamp,
          version: result.rows[0]?.version,
          poolSize: this.pool.totalCount,
          idleConnections: this.pool.idleCount,
          waitingClients: this.pool.waitingCount
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Graceful shutdown
  public async close(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;
  }
}

// Database models for type safety
export interface Tenant {
  id: string;
  name: string;
  type: 'LOCAL_AUTHORITY' | 'HEALTHCARE' | 'EDUCATION' | 'ENTERPRISE';
  domain: string;
  subdomain: string;
  settings: Record<string, any>;
  subscription_tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  role: 'PARENT' | 'PROFESSIONAL' | 'LA_OFFICER' | 'LA_CASEWORKER' | 'LA_MANAGER' | 'LA_EXECUTIVE' | 'ADMIN' | 'ENTERPRISE_ADMIN';
  tenant_id: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  profile_data: Record<string, any>;
  permissions: string[];
}

export interface Child {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  nhs_number?: string;
  upn?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface EHCCase {
  id: string;
  case_number: string;
  child_id: string;
  tenant_id: string;
  status: 'PENDING' | 'ASSESSMENT' | 'DRAFT' | 'FINAL' | 'REVIEW' | 'APPEAL' | 'CLOSED';
  case_type: 'INITIAL' | 'REVIEW' | 'AMENDMENT' | 'TRANSFER' | 'APPEAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigned_officer_id?: string;
  assigned_caseworker_id?: string;
  created_at: Date;
  updated_at: Date;
  statutory_deadline?: Date;
  actual_completion_date?: Date;
  case_data: Record<string, any>;
  workflow_state: Record<string, any>;
  estimated_budget?: number;
  actual_cost: number;
}

export interface FinancialTransaction {
  id: string;
  case_id: string;
  tenant_id: string;
  transaction_type: 'EDUCATION' | 'HEALTH' | 'TRANSPORT' | 'LEGAL' | 'ADMIN' | 'PROFESSIONAL_SERVICE' | 'PLACEMENT' | 'EQUIPMENT';
  amount: number;
  currency: string;
  vendor_id?: string;
  description: string;
  transaction_date: Date;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approved_by_id?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  case_id: string;
  tenant_id: string;
  uploaded_by_id: string;
  file_name: string;
  original_file_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  document_type: string;
  document_category: string;
  version: number;
  is_confidential: boolean;
  ai_extracted_data: Record<string, any>;
  ocr_text?: string;
  created_at: Date;
  updated_at: Date;
  checksum: string;
}

// Repository pattern for data access
export class Repository<T> {
  constructor(
    private db: Database,
    private tableName: string
  ) {}

  async findById(id: string, tenantId?: string): Promise<T | null> {
    const result = await this.db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id],
      tenantId
    );
    return result.rows[0] || null;
  }

  async findMany(
    filters: Record<string, any> = {},
    options: { limit?: number; offset?: number; orderBy?: string } = {},
    tenantId?: string
  ): Promise<{ data: T[]; total: number }> {
    const whereClause = Object.keys(filters).length > 0
      ? 'WHERE ' + Object.keys(filters).map((key, index) => `${key} = $${index + 1}`).join(' AND ')
      : '';

    const orderBy = options.orderBy || 'created_at DESC';
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`;
    const dataQuery = `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY ${orderBy} LIMIT $${Object.keys(filters).length + 1} OFFSET $${Object.keys(filters).length + 2}`;

    const [countResult, dataResult] = await Promise.all([
      this.db.query(countQuery, Object.values(filters), tenantId),
      this.db.query(dataQuery, [...Object.values(filters), limit, offset], tenantId)
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>, tenantId?: string): Promise<T> {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');

    const result = await this.db.query(
      `INSERT INTO ${this.tableName} (${fields}, created_at, updated_at)
       VALUES (${placeholders}, NOW(), NOW())
       RETURNING *`,
      Object.values(data),
      tenantId
    );

    return result.rows[0];
  }

  async update(id: string, data: Partial<T>, tenantId?: string): Promise<T | null> {
    const fields = Object.keys(data).map((key, index) => `${key} = $${index + 2}`).join(', ');

    const result = await this.db.query(
      `UPDATE ${this.tableName}
       SET ${fields}, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, ...Object.values(data)],
      tenantId
    );

    return result.rows[0] || null;
  }

  async delete(id: string, tenantId?: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id],
      tenantId
    );

    return (result.rowCount || 0) > 0;
  }
}

// Helper function for database operations
export async function withDatabase<T>(
  callback: (client: PoolClient) => Promise<T>,
  tenantId?: string
): Promise<T> {
  const database = Database.getInstance();
  return await database.transaction(callback, tenantId);
}

// Simple cache service for frequently accessed data
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private defaultTTL: number = 300000; // 5 minutes

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  public get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const db = Database.getInstance();
export const tenantRepo = new Repository<Tenant>(db, 'tenants');
export const userRepo = new Repository<User>(db, 'users');
export const childRepo = new Repository<Child>(db, 'children');
export const caseRepo = new Repository<EHCCase>(db, 'ehc_cases');
export const transactionRepo = new Repository<FinancialTransaction>(db, 'financial_transactions');
export const documentRepo = new Repository<Document>(db, 'documents');

// Connection health monitoring
export async function checkDatabaseHealth() {
  return await db.healthCheck();
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  await db.close();
}
