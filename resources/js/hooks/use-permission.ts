import { usePage } from '@inertiajs/react';
import { AuthState, hasPermission, hasRole, hasAnyPermission, hasAllPermissions } from '@/lib/permission';

export function usePermission() {
    const pageProps = usePage<{ auth?: { user?: AuthState['user'] } }>().props;
    const authState: AuthState = { user: pageProps.auth?.user };

    return {
        user: pageProps.auth?.user,
        isAdmin: !!pageProps.auth?.user?.is_admin,
        can: (perm: string | string[]) => hasPermission(authState, perm),
        hasRole: (role: string | string[]) => hasRole(authState, role),
        hasPermission: (perm: string | string[]) => hasPermission(authState, perm),
        hasAnyPermission: (perms: string[]) => hasAnyPermission(authState, perms),
        hasAllPermissions: (perms: string[]) => hasAllPermissions(authState, perms),
    };
}
