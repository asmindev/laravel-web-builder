import React from 'react';
import { usePermission } from '@/hooks/use-permission';

interface CanProps {
    perm?: string | string[];
    role?: string | string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function Can({ perm, role, children, fallback = null }: CanProps) {
    const { can, hasRole } = usePermission();

    let allowed = true;

    if (perm) {
        allowed = allowed && can(perm);
    }

    if (role) {
        allowed = allowed && hasRole(role);
    }

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

export default Can;
