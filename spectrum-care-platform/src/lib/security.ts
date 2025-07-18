// Enterprise Security Framework for SpectrumCare Platform
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import { Database } from './database';

// Security configuration schema
const securityConfigSchema = z.object({
  encryptionKey: z.string().min(32),
  jwtSecret: z.string().min(32),
  saltRounds: z.number().default(12),
  sessionTimeout: z.number().default(86400), // 24 hours
  maxLoginAttempts: z.number().default(5),
  lockoutDuration: z.number().default(900), // 15 minutes
  passwordMinLength: z.number().default(12),
  mfaRequired: z.boolean().default(false)
});

type SecurityConfig = z.infer<typeof securityConfigSchema>;

// ============================================================================
// ENCRYPTION SERVICE
// ============================================================================

export class EncryptionService {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyDerivationIterations = 100000;

  private static getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    return key;
  }

  // Encrypt sensitive data at field level
  static encryptField(plaintext: string, salt?: string): { encrypted: string; salt: string; iv: string } {
    const masterKey = this.getEncryptionKey();
    const useSalt = salt || crypto.randomBytes(16).toString('hex');

    // Derive key from master key and salt
    const derivedKey = crypto.pbkdf2Sync(masterKey, useSalt, this.keyDerivationIterations, 32, 'sha256');

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, derivedKey);
    cipher.setAAD(Buffer.from('SpectrumCare-Auth'));

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted + ':' + authTag.toString('hex'),
      salt: useSalt,
      iv: iv.toString('hex')
    };
  }

  // Decrypt sensitive data
  static decryptField(encryptedData: string, salt: string, iv: string): string {
    const masterKey = this.getEncryptionKey();

    // Derive key from master key and salt
    const derivedKey = crypto.pbkdf2Sync(masterKey, salt, this.keyDerivationIterations, 32, 'sha256');

    const [encrypted, authTag] = encryptedData.split(':');

    const decipher = crypto.createDecipher(this.algorithm, derivedKey);
    decipher.setAAD(Buffer.from('SpectrumCare-Auth'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Hash passwords with bcrypt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate secure random tokens
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash data for integrity checking
  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Create file checksum
  static createChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION SERVICE
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
  permissions: string[];
  mfa_enabled: boolean;
  session_id: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
  scope: string[];
}

export class AuthenticationService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

  // Generate JWT tokens
  static generateTokens(user: AuthUser): AuthToken {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      permissions: user.permissions,
      session_id: user.session_id,
      type: 'access'
    };

    const refreshPayload = {
      sub: user.id,
      session_id: user.session_id,
      type: 'refresh'
    };

    const expiresIn = 3600; // 1 hour
    const refreshExpiresIn = 7 * 24 * 3600; // 7 days

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn,
      issuer: 'SpectrumCare',
      audience: 'spectrum-care-platform'
    });

    const refreshToken = jwt.sign(refreshPayload, this.JWT_REFRESH_SECRET, {
      expiresIn: refreshExpiresIn,
      issuer: 'SpectrumCare',
      audience: 'spectrum-care-platform'
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      token_type: 'Bearer',
      scope: user.permissions
    };
  }

  // Verify JWT token
  static verifyToken(token: string): AuthUser | null {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'SpectrumCare',
        audience: 'spectrum-care-platform'
      }) as any;

      if (payload.type !== 'access') {
        return null;
      }

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        tenant_id: payload.tenant_id,
        permissions: payload.permissions || [],
        mfa_enabled: payload.mfa_enabled || false,
        session_id: payload.session_id
      };
    } catch (error) {
      return null;
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<AuthToken | null> {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET, {
        issuer: 'SpectrumCare',
        audience: 'spectrum-care-platform'
      }) as any;

      if (payload.type !== 'refresh') {
        return null;
      }

      // Get user data from database
      const db = Database.getInstance();
      const result = await db.query(
        'SELECT id, email, role, tenant_id, permissions, mfa_enabled FROM users WHERE id = $1 AND is_active = true',
        [payload.sub]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return this.generateTokens({
        ...user,
        session_id: payload.session_id
      });
    } catch (error) {
      return null;
    }
  }

  // Validate session
  static async validateSession(sessionId: string, userId: string): Promise<boolean> {
    const db = Database.getInstance();
    const result = await db.query(
      'SELECT id FROM user_sessions WHERE session_id = $1 AND user_id = $2 AND expires_at > NOW() AND is_active = true',
      [sessionId, userId]
    );

    return result.rows.length > 0;
  }

  // Invalidate session
  static async invalidateSession(sessionId: string): Promise<void> {
    const db = Database.getInstance();
    await db.query(
      'UPDATE user_sessions SET is_active = false WHERE session_id = $1',
      [sessionId]
    );
  }
}

// ============================================================================
// AUTHORIZATION SERVICE
// ============================================================================

export class AuthorizationService {
  private static readonly rolePermissions: Record<string, string[]> = {
    'PARENT': [
      'read:own_children',
      'read:own_cases',
      'create:documents',
      'read:own_documents',
      'create:communications',
      'read:own_communications'
    ],
    'PROFESSIONAL': [
      'read:assigned_cases',
      'update:assigned_cases',
      'create:assessments',
      'read:assessments',
      'update:assessments',
      'create:documents',
      'read:documents',
      'create:communications',
      'read:communications'
    ],
    'LA_OFFICER': [
      'read:cases',
      'create:cases',
      'update:cases',
      'read:documents',
      'create:documents',
      'read:financial_basic',
      'create:communications',
      'read:communications'
    ],
    'LA_CASEWORKER': [
      'read:cases',
      'create:cases',
      'update:cases',
      'delete:cases',
      'read:documents',
      'create:documents',
      'update:documents',
      'read:financial_detailed',
      'create:financial_transactions',
      'read:workflows',
      'create:workflows',
      'update:workflows',
      'manage:team_assignments'
    ],
    'LA_MANAGER': [
      'read:all_cases',
      'update:all_cases',
      'read:all_documents',
      'read:financial_full',
      'approve:financial_transactions',
      'read:analytics',
      'manage:team',
      'manage:resources',
      'read:budget',
      'update:budget'
    ],
    'LA_EXECUTIVE': [
      'read:all_data',
      'manage:all_cases',
      'read:financial_executive',
      'approve:budget',
      'read:performance_analytics',
      'manage:strategic_initiatives',
      'read:compliance_reports'
    ],
    'ENTERPRISE_ADMIN': [
      'read:enterprise_data',
      'manage:multi_tenant',
      'read:cross_authority_analytics',
      'manage:enterprise_initiatives',
      'configure:system',
      'manage:security'
    ],
    'ADMIN': [
      'manage:all',
      'configure:system',
      'manage:users',
      'manage:security',
      'read:audit_logs',
      'manage:backups'
    ]
  };

  static hasPermission(user: AuthUser, permission: string): boolean {
    // Check explicit permissions
    if (user.permissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const rolePerms = this.rolePermissions[user.role] || [];
    return rolePerms.includes(permission);
  }

  static hasAnyPermission(user: AuthUser, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  static hasAllPermissions(user: AuthUser, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  // Check if user can access resource
  static canAccessResource(
    user: AuthUser,
    resourceType: string,
    resourceId: string,
    action: string
  ): boolean {
    // Construct permission string
    const permission = `${action}:${resourceType}`;

    if (!this.hasPermission(user, permission)) {
      return false;
    }

    // Additional checks for resource ownership
    // This would integrate with the database to check ownership
    return true;
  }
}

// ============================================================================
// AUDIT LOGGING SERVICE
// ============================================================================

export interface AuditLogEntry {
  id?: string;
  tenant_id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  timestamp: Date;
  sensitive: boolean;
  compliance_relevant: boolean;
}

export class AuditService {
  private static db = Database.getInstance();

  // Log audit event
  static async logEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO audit_logs (
          tenant_id, user_id, action, resource_type, resource_id,
          old_values, new_values, ip_address, user_agent, session_id,
          created_at, sensitive, compliance_relevant
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, $12)
      `, [
        entry.tenant_id,
        entry.user_id,
        entry.action,
        entry.resource_type,
        entry.resource_id,
        entry.old_values ? JSON.stringify(entry.old_values) : null,
        entry.new_values ? JSON.stringify(entry.new_values) : null,
        entry.ip_address,
        entry.user_agent,
        entry.session_id,
        entry.sensitive,
        entry.compliance_relevant
      ]);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // In production, might want to queue for retry
    }
  }

  // Query audit logs
  static async queryLogs(
    tenantId: string,
    filters: {
      user_id?: string;
      action?: string;
      resource_type?: string;
      start_date?: Date;
      end_date?: Date;
      sensitive_only?: boolean;
    },
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    let whereConditions = ['tenant_id = $1'];
    let params: any[] = [tenantId];
    let paramCount = 1;

    if (filters.user_id) {
      whereConditions.push(`user_id = $${++paramCount}`);
      params.push(filters.user_id);
    }

    if (filters.action) {
      whereConditions.push(`action = $${++paramCount}`);
      params.push(filters.action);
    }

    if (filters.resource_type) {
      whereConditions.push(`resource_type = $${++paramCount}`);
      params.push(filters.resource_type);
    }

    if (filters.start_date) {
      whereConditions.push(`created_at >= $${++paramCount}`);
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      whereConditions.push(`created_at <= $${++paramCount}`);
      params.push(filters.end_date);
    }

    if (filters.sensitive_only) {
      whereConditions.push('sensitive = true');
    }

    const query = `
      SELECT * FROM audit_logs
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${++paramCount}
    `;
    params.push(limit);

    const result = await this.db.query(query, params);
    return result.rows;
  }
}

// ============================================================================
// GDPR COMPLIANCE SERVICE
// ============================================================================

export class GDPRService {
  private static db = Database.getInstance();

  // Data subject access request
  static async exportUserData(userId: string, tenantId: string): Promise<{
    personal_data: Record<string, any>;
    cases: any[];
    documents: any[];
    communications: any[];
    audit_trail: any[];
  }> {
    const userDataQuery = `
      SELECT id, email, first_name, last_name, phone, created_at, last_login,
             profile_data, preferences
      FROM users
      WHERE id = $1 AND tenant_id = $2
    `;

    const casesQuery = `
      SELECT c.*, ch.first_name as child_first_name, ch.last_name as child_last_name
      FROM ehc_cases c
      LEFT JOIN family_relationships fr ON c.child_id = fr.child_id
      LEFT JOIN children ch ON c.child_id = ch.id
      WHERE fr.parent_user_id = $1 AND c.tenant_id = $2
    `;

    const documentsQuery = `
      SELECT id, file_name, document_type, created_at, file_size
      FROM documents
      WHERE uploaded_by_id = $1 AND tenant_id = $2
    `;

    const communicationsQuery = `
      SELECT id, subject, content, sent_at, communication_type
      FROM messages
      WHERE sender_id = $1 AND tenant_id = $2
      ORDER BY sent_at DESC
    `;

    const auditQuery = `
      SELECT action, resource_type, created_at, ip_address
      FROM audit_logs
      WHERE user_id = $1 AND tenant_id = $2
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    const [userData, cases, documents, communications, auditTrail] = await Promise.all([
      this.db.query(userDataQuery, [userId, tenantId]),
      this.db.query(casesQuery, [userId, tenantId]),
      this.db.query(documentsQuery, [userId, tenantId]),
      this.db.query(communicationsQuery, [userId, tenantId]),
      this.db.query(auditQuery, [userId, tenantId])
    ]);

    return {
      personal_data: userData.rows[0] || {},
      cases: cases.rows,
      documents: documents.rows,
      communications: communications.rows,
      audit_trail: auditTrail.rows
    };
  }

  // Right to be forgotten
  static async deleteUserData(userId: string, tenantId: string): Promise<{
    deleted: boolean;
    anonymized_records: number;
    retention_records: number;
  }> {
    // This is a complex operation that requires careful handling
    // Some data may need to be retained for legal/regulatory reasons

    return this.db.transaction(async (client) => {
      // Anonymize audit logs (retain for compliance but remove PII)
      const auditUpdate = await client.query(`
        UPDATE audit_logs
        SET user_id = NULL, ip_address = NULL, user_agent = 'ANONYMIZED'
        WHERE user_id = $1 AND tenant_id = $2
      `, [userId, tenantId]);

      // Delete user account
      await client.query(`
        UPDATE users
        SET email = 'deleted-' || id::text || '@anonymized.local',
            first_name = 'DELETED',
            last_name = 'USER',
            phone = NULL,
            is_active = false,
            profile_data = '{}',
            preferences = '{}'
        WHERE id = $1 AND tenant_id = $2
      `, [userId, tenantId]);

      // Handle documents - may need special retention rules
      const documentCount = await client.query(`
        SELECT COUNT(*) as count
        FROM documents
        WHERE uploaded_by_id = $1 AND tenant_id = $2
      `, [userId, tenantId]);

      return {
        deleted: true,
        anonymized_records: auditUpdate.rowCount || 0,
        retention_records: parseInt(documentCount.rows[0].count)
      };
    }, tenantId);
  }

  // Data processing consent management
  static async updateConsent(
    userId: string,
    tenantId: string,
    consentType: string,
    granted: boolean
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO user_consents (user_id, tenant_id, consent_type, granted, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, tenant_id, consent_type)
      DO UPDATE SET granted = $4, updated_at = NOW()
    `, [userId, tenantId, consentType, granted]);

    // Log consent change
    await AuditService.logEvent({
      tenant_id: tenantId,
      user_id: userId,
      action: 'UPDATE_CONSENT',
      resource_type: 'USER_CONSENT',
      new_values: { consent_type: consentType, granted },
      sensitive: true,
      compliance_relevant: true
    });
  }
}

// ============================================================================
// SECURITY MONITORING SERVICE
// ============================================================================

export class SecurityMonitoringService {
  private static db = Database.getInstance();

  // Detect suspicious activities
  static async detectSuspiciousActivity(
    userId: string,
    tenantId: string,
    action: string,
    ipAddress: string
  ): Promise<{ suspicious: boolean; reasons: string[]; riskScore: number }> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for multiple login attempts
    const recentAttempts = await this.db.query(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE user_id = $1 AND action = 'LOGIN_ATTEMPT'
        AND created_at > NOW() - INTERVAL '1 hour'
    `, [userId]);

    if (parseInt(recentAttempts.rows[0].count) > 10) {
      reasons.push('Excessive login attempts');
      riskScore += 30;
    }

    // Check for unusual IP address
    const knownIPs = await this.db.query(`
      SELECT DISTINCT ip_address
      FROM audit_logs
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      LIMIT 5
    `, [userId]);

    const knownIPList = knownIPs.rows.map(row => row.ip_address);
    if (!knownIPList.includes(ipAddress)) {
      reasons.push('New IP address');
      riskScore += 20;
    }

    // Check for unusual access patterns
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      reasons.push('Unusual access time');
      riskScore += 10;
    }

    return {
      suspicious: riskScore > 40,
      reasons,
      riskScore
    };
  }

  // Monitor for data breaches
  static async checkDataBreach(
    tenantId: string,
    timeframe: string = '24 hours'
  ): Promise<{
    potential_breach: boolean;
    indicators: string[];
    affected_records: number;
  }> {
    const indicators: string[] = [];
    let affectedRecords = 0;

    // Check for mass data access
    const massAccess = await this.db.query(`
      SELECT user_id, COUNT(*) as access_count
      FROM audit_logs
      WHERE tenant_id = $1
        AND action LIKE '%READ%'
        AND created_at > NOW() - INTERVAL '${timeframe}'
      GROUP BY user_id
      HAVING COUNT(*) > 1000
    `, [tenantId]);

    if (massAccess.rows.length > 0) {
      indicators.push('Mass data access detected');
      affectedRecords += massAccess.rows.reduce((sum, row) => sum + parseInt(row.access_count), 0);
    }

    // Check for unauthorized access to sensitive data
    const sensitiveAccess = await this.db.query(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE tenant_id = $1
        AND sensitive = true
        AND created_at > NOW() - INTERVAL '${timeframe}'
    `, [tenantId]);

    const sensitiveCount = parseInt(sensitiveAccess.rows[0].count);
    if (sensitiveCount > 100) {
      indicators.push('High volume sensitive data access');
      affectedRecords += sensitiveCount;
    }

    return {
      potential_breach: indicators.length > 0,
      indicators,
      affected_records: affectedRecords
    };
  }
}

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

// Rate limiting configurations
export const createRateLimiter = (windowMs: number, max: number) => rateLimit({
  windowMs,
  max,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input validation and sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 12) score += 20;
  else feedback.push('Password should be at least 12 characters long');

  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  else feedback.push('Include special characters');

  if (password.length > 16) score += 15;

  return {
    valid: score >= 70,
    score,
    feedback
  };
};

// Export security configuration
export const getSecurityConfig = (): SecurityConfig => {
  return securityConfigSchema.parse({
    encryptionKey: process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
    jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400'),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900'),
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '12'),
    mfaRequired: process.env.MFA_REQUIRED === 'true'
  });
};
