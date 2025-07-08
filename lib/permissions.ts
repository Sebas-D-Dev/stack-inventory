// Role hierarchy with security levels
export const ROLE_LEVELS = {
  'USER': 0,
  'VENDOR': 1,
  'MODERATOR': 2,
  'ADMIN': 3,
  'SUPER_ADMIN': 4
} as const;

export type Role = keyof typeof ROLE_LEVELS;

// Helper function to get role level
export function getRoleLevel(role: string): number {
  return ROLE_LEVELS[role as Role] ?? 0;
}

// Check if user has minimum required role level
export function hasMinimumRole(userRole: string, requiredRole: Role): boolean {
  return getRoleLevel(userRole) >= ROLE_LEVELS[requiredRole];
}

// Specific permission functions
export function canAccessAdminFeatures(role: string): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

export function canModerateContent(role: string): boolean {
  return hasMinimumRole(role, 'MODERATOR');
}

export function canManageUsers(role: string): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

export function canManageSystemSettings(role: string): boolean {
  return role === 'SUPER_ADMIN';
}

export function canManageProducts(role: string): boolean {
  return hasMinimumRole(role, 'VENDOR');
}

export function canBulkImportProducts(role: string): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

export function canViewUserActivity(role: string): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

export function canResetUserPasswords(role: string): boolean {
  return hasMinimumRole(role, 'ADMIN');
}

// Content permissions
export function canCreatePost(role: string): boolean {
  return hasMinimumRole(role, 'USER');
}

export function canEditPost(role: string, isOwner: boolean): boolean {
  return isOwner || hasMinimumRole(role, 'MODERATOR');
}

export function canDeletePost(role: string, isOwner: boolean): boolean {
  return isOwner || hasMinimumRole(role, 'MODERATOR');
}

export function canApproveContent(role: string): boolean {
  return hasMinimumRole(role, 'MODERATOR');
}