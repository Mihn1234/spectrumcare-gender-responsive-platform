import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/database';
import { User } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  role: 'PARENT' | 'PROFESSIONAL' | 'LA_OFFICER' | 'LA_CASEWORKER' | 'LA_MANAGER' | 'LA_EXECUTIVE' | 'ADMIN' | 'ENTERPRISE_ADMIN' | 'SCHOOL_SENCO' | 'HEALTHCARE_PROVIDER';
  tenant_id: string;
  profile_data: Record<string, any>;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: AuthUser['role'];
  firstName: string;
  lastName: string;
  organization?: string;
  phone?: string;
}

export class AuthService {
  // Generate JWT tokens
  static generateTokens(user: AuthUser) {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Compare passwords
  static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // User registration
  static async register(data: RegisterData): Promise<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create user
      const result = await db.query(`
        INSERT INTO users (
          email, password_hash, role, first_name, last_name,
          organization, phone, is_active, email_verified,
          profile_data, permissions, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, false, $8, $9, NOW(), NOW())
        RETURNING id, email, role, tenant_id, profile_data, permissions
      `, [
        data.email,
        hashedPassword,
        data.role,
        data.firstName,
        data.lastName,
        data.organization || null,
        data.phone || null,
        JSON.stringify({ firstName: data.firstName, lastName: data.lastName, organization: data.organization }),
        JSON.stringify(this.getDefaultPermissions(data.role))
      ]);

      const user = result.rows[0] as AuthUser;
      const tokens = this.generateTokens(user);

      return { user, tokens };
    } catch (error) {
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // User login
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      const result = await db.query(`
        SELECT id, email, password_hash, role, tenant_id, profile_data, permissions, is_active
        FROM users WHERE email = $1
      `, [credentials.email]);

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      const isValidPassword = await this.comparePasswords(credentials.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        profile_data: user.profile_data,
        permissions: user.permissions
      };

      const tokens = this.generateTokens(authUser);

      // Update last login
      await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

      return { user: authUser, tokens };
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const result = await db.query(`
        SELECT id, email, role, tenant_id, profile_data, permissions
        FROM users WHERE id = $1 AND is_active = true
      `, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as AuthUser;
    } catch (error) {
      return null;
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
      const user = await this.getUserById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Get default permissions for role
  static getDefaultPermissions(role: AuthUser['role']): string[] {
    const permissions: Record<AuthUser['role'], string[]> = {
      PARENT: ['view_own_children', 'manage_own_case', 'upload_documents', 'view_reports'],
      PROFESSIONAL: ['view_assigned_cases', 'create_assessments', 'manage_schedule', 'billing_access'],
      LA_OFFICER: ['view_la_cases', 'assign_caseworkers', 'approve_requests', 'generate_reports'],
      LA_CASEWORKER: ['manage_assigned_cases', 'update_case_status', 'communicate_families'],
      LA_MANAGER: ['view_team_cases', 'assign_cases', 'approve_budgets', 'team_reports'],
      LA_EXECUTIVE: ['view_all_cases', 'strategic_oversight', 'budget_management', 'performance_analytics'],
      SCHOOL_SENCO: ['manage_school_send', 'create_ihps', 'track_progress', 'coordinate_support'],
      HEALTHCARE_PROVIDER: ['view_patient_cases', 'create_assessments', 'manage_appointments', 'clinical_reports'],
      ADMIN: ['full_access', 'user_management', 'system_configuration', 'audit_logs'],
      ENTERPRISE_ADMIN: ['manage_organization', 'user_administration', 'billing_management', 'analytics_access']
    };

    return permissions[role] || [];
  }

  // Check if user has permission
  static hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.includes(permission) || user.permissions.includes('full_access');
  }

  // Update user profile
  static async updateProfile(userId: string, profileData: Partial<User>): Promise<AuthUser | null> {
    try {
      const result = await db.query(`
        UPDATE users
        SET profile_data = $2, updated_at = NOW()
        WHERE id = $1 AND is_active = true
        RETURNING id, email, role, tenant_id, profile_data, permissions
      `, [userId, JSON.stringify(profileData)]);

      return result.rows[0] as AuthUser || null;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const isValidPassword = await this.comparePasswords(currentPassword, result.rows[0].password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      const newHashedPassword = await this.hashPassword(newPassword);
      await db.query('UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1', [userId, newHashedPassword]);

      return true;
    } catch (error) {
      throw new Error(`Password change failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Password reset (generate token)
  static async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const result = await db.query('SELECT id FROM users WHERE email = $1 AND is_active = true', [email]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const resetToken = jwt.sign(
        { userId: result.rows[0].id, email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token with expiry
      await db.query(`
        UPDATE users
        SET reset_token = $2, reset_token_expires = NOW() + INTERVAL '1 hour'
        WHERE id = $1
      `, [result.rows[0].id, resetToken]);

      return resetToken;
    } catch (error) {
      throw new Error('Failed to generate reset token');
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const result = await db.query(`
        SELECT id FROM users
        WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()
      `, [decoded.userId, token]);

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await this.hashPassword(newPassword);

      await db.query(`
        UPDATE users
        SET password_hash = $2, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
        WHERE id = $1
      `, [decoded.userId, hashedPassword]);

      return true;
    } catch (error) {
      throw new Error('Password reset failed');
    }
  }
}
