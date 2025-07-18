// Role-Based Access Control System
export type Role = 'parent' | 'professional' | 'la_officer' | 'admin' | 'guest';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export const rolePermissions: Record<Role, Permission[]> = {
  parent: [
    { resource: 'child-profile', action: 'create' },
    { resource: 'child-profile', action: 'read' },
    { resource: 'child-profile', action: 'update' },
    { resource: 'adult-profile', action: 'create' },
    { resource: 'adult-profile', action: 'read' },
    { resource: 'adult-profile', action: 'update' },
    { resource: 'document', action: 'create' },
    { resource: 'document', action: 'read' },
    { resource: 'review', action: 'create' },
    { resource: 'review', action: 'read' },
    { resource: 'assessment', action: 'read' },
    { resource: 'plan-import', action: 'create' },
    { resource: 'plan-import', action: 'read' },
    { resource: 'content', action: 'read' },
    { resource: 'notification', action: 'read' },
  ],
  professional: [
    { resource: 'assessment', action: 'create' },
    { resource: 'assessment', action: 'read' },
    { resource: 'assessment', action: 'update' },
    { resource: 'document', action: 'create' },
    { resource: 'document', action: 'read' },
    { resource: 'review', action: 'read' },
    { resource: 'review', action: 'update' },
    { resource: 'professional-profile', action: 'update' },
    { resource: 'white-label', action: 'create' },
    { resource: 'white-label', action: 'read' },
    { resource: 'white-label', action: 'update' },
    { resource: 'toolkit', action: 'create' },
    { resource: 'toolkit', action: 'read' },
    { resource: 'toolkit', action: 'update' },
    { resource: 'client-portal', action: 'read' },
    { resource: 'ai-analysis', action: 'create' },
    { resource: 'ai-analysis', action: 'read' },
  ],
  la_officer: [
    { resource: 'child-profile', action: 'read' },
    { resource: 'adult-profile', action: 'read' },
    { resource: 'ehc-plan', action: 'create' },
    { resource: 'ehc-plan', action: 'read' },
    { resource: 'ehc-plan', action: 'update' },
    { resource: 'shadow-plan', action: 'create' },
    { resource: 'shadow-plan', action: 'read' },
    { resource: 'shadow-plan', action: 'update' },
    { resource: 'review', action: 'create' },
    { resource: 'review', action: 'read' },
    { resource: 'review', action: 'update' },
    { resource: 'assessment', action: 'read' },
    { resource: 'caseload', action: 'create' },
    { resource: 'caseload', action: 'read' },
    { resource: 'caseload', action: 'update' },
    { resource: 'guest-access', action: 'create' },
    { resource: 'guest-access', action: 'read' },
    { resource: 'guest-access', action: 'update' },
    { resource: 'financial-tracking', action: 'read' },
    { resource: 'approval-workflow', action: 'create' },
    { resource: 'approval-workflow', action: 'read' },
    { resource: 'approval-workflow', action: 'update' },
    { resource: 'tribunal-support', action: 'create' },
    { resource: 'tribunal-support', action: 'read' },
    { resource: 'tribunal-support', action: 'update' },
  ],
  admin: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
  guest: [
    { resource: 'document', action: 'create' },
    { resource: 'document', action: 'read' },
    { resource: 'assessment', action: 'read' },
    { resource: 'assessment', action: 'update' },
    { resource: 'review', action: 'read' },
    { resource: 'ai-analysis', action: 'read' },
  ],
};

export function hasPermission(
  userRole: Role,
  resource: string,
  action: Permission['action']
): boolean {
  const permissions = rolePermissions[userRole];

  return permissions.some(
    (permission) =>
      (permission.resource === resource || permission.resource === '*') &&
      permission.action === action
  );
}

export function requirePermission(
  userRole: Role,
  resource: string,
  action: Permission['action']
) {
  if (!hasPermission(userRole, resource, action)) {
    throw new Error(`Insufficient permissions: ${userRole} cannot ${action} ${resource}`);
  }
}

export function checkAccess(userRole: Role, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission =>
    hasPermission(userRole, permission.resource, permission.action)
  );
}

// Role hierarchy for inheritance
export const roleHierarchy: Record<Role, Role[]> = {
  admin: ['admin', 'la_officer', 'professional', 'parent', 'guest'],
  la_officer: ['la_officer', 'guest'],
  professional: ['professional', 'guest'],
  parent: ['parent'],
  guest: ['guest'],
};

export function hasRoleAccess(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole]?.includes(requiredRole) || false;
}
