export interface AuthState {
    user?: {
        id: number;
        name: string;
        email: string;
        plan: string;
        plan_name: string;
        project_limit: number | string;
        raw_limit: number;
        projects_count: number;
        can_create_project: boolean;
        is_admin: boolean;
        roles: string[];
        permissions: string[];
    } | null;
}

/**
 * Check if the authenticated user has a specific permission or set of permissions
 */
export function hasPermission(auth: AuthState | null | undefined, perm: string | string[]): boolean {
    if (!auth?.user) return false;

    // Super Admin has all permissions
    if (auth.user.is_admin || auth.user.roles?.includes('admin')) {
        return true;
    }

    const userPermissions = auth.user.permissions || [];

    if (Array.isArray(perm)) {
        return perm.some((p) => userPermissions.includes(p));
    }

    return userPermissions.includes(perm);
}

/**
 * Check if the authenticated user has a specific role or set of roles
 */
export function hasRole(auth: AuthState | null | undefined, role: string | string[]): boolean {
    if (!auth?.user) return false;

    const userRoles = auth.user.roles || [];

    if (Array.isArray(role)) {
        return role.some((r) => userRoles.includes(r));
    }

    return userRoles.includes(role);
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(auth: AuthState | null | undefined, perms: string[]): boolean {
    return hasPermission(auth, perms);
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(auth: AuthState | null | undefined, perms: string[]): boolean {
    if (!auth?.user) return false;
    if (auth.user.is_admin || auth.user.roles?.includes('admin')) return true;

    const userPermissions = auth.user.permissions || [];
    return perms.every((p) => userPermissions.includes(p));
}
