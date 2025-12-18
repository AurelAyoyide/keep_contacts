'use client';

import { useAuth } from '@/contexts/auth-context';
import { Menu, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user } = useAuth();
    const pathname = usePathname();

    // Simple breadcrumb generation
    // /dashboard -> Dashboard
    // /dashboard/organizations/123 -> Dashboard > Organizations  (simplified)

    const getBreadcrumb = () => {
        if (pathname === '/dashboard') return 'Dashboard';
        if (pathname.includes('/groups')) return 'Group Details';
        if (pathname.includes('/organizations')) {
            if (pathname.split('/').length > 3) return 'Organization Details';
            return 'Organizations';
        }
        return 'Dashboard';
    };

    return (
        <header className="flex h-16 w-full items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold text-foreground">{getBreadcrumb()}</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none">{user?.email}</p>
                        {/* <p className="text-xs text-muted-foreground">Admin</p> */}
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </header>
    );
}
