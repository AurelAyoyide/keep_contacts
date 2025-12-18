'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Users, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { CreateOrganizationModal } from '@/components/organizations/CreateOrganizationModal';
import { Organization } from '@/types';
import api from '@/lib/api';

export default function DashboardPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: organizations, isLoading } = useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const { data } = await api.get<Organization[]>('/organizations');
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
                    <p className="text-muted-foreground">
                        Manage your organizations and their contact groups.
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Organization
                </Button>
            </div>

            {!organizations || organizations.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No organizations yet</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Create your first organization to start collecting and managing contacts.
                    </p>
                    <Button className="mt-6" onClick={() => setIsCreateModalOpen(true)}>
                        Create Organization
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org) => (
                        <Link key={org.id} href={`/dashboard/organizations/${org.id}`}>
                            <Card variant="clickable" className="h-full p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    {org._count && (
                                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                            {org._count.groups} groups
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-semibold">{org.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground truncate">
                                    {org.autoTag ? `Auto-tag: ${org.autoTag}` : 'No auto-tag'}
                                </p>
                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                    <FolderOpen className="mr-1 h-4 w-4" />
                                    <span>Manage Groups</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <CreateOrganizationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
