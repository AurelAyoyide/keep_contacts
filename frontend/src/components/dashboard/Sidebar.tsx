'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Building2, LogOut, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const links = [
        {
            href: '/dashboard',
            label: 'Organizations',
            icon: Building2,
            active: pathname === '/dashboard' || pathname.startsWith('/dashboard/organizations'),
        },
        // Future expansion
        // {
        //   href: '/dashboard/settings',
        //   label: 'Settings',
        //   icon: Settings,
        //   active: pathname.startsWith('/dashboard/settings'),
        // },
    ];

    return (
        <div className={cn("flex h-full w-64 flex-col border-r bg-card", className)}>
            <div className="flex h-16 items-center px-6 border-b">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Keep Contacts</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3">
                <nav className="space-y-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                link.active
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <link.icon className={cn("mr-3 h-5 w-5 flex-shrink-0", link.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="border-t p-4">
                <button
                    onClick={logout}
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
