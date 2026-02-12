'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, FolderOpen, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { CreateOrganizationModal } from '@/components/organizations/CreateOrganizationModal';
import { EditOrganizationModal } from '@/components/organizations/EditOrganizationModal';
import { DeleteOrganizationModal } from '@/components/organizations/DeleteOrganizationModal';
import { Organization } from '@/types';
import api from '@/lib/api';

export default function DashboardPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);

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
                        <Card key={org.id} className="h-full p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        {org._count && (
                                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                                {org._count.groups} groups
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Dropdown Menu */}
                                <div className="relative group">
                                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setEditingOrg(org);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 border-b last:border-0"
                                        >
                                            <Edit2 className="h-4 w-4" /> Edit Organization
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setDeletingOrg(org);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Link href={`/dashboard/organizations/${org.id}`}>
                                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                                    <h3 className="text-xl font-semibold">{org.name}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground truncate">
                                        {org.autoTag ? (
                                            <>
                                                Auto-tag: {org.autoTag}
                                                {org.tagEnabled === false && ' (disabled)'}
                                            </>
                                        ) : (
                                            'No auto-tag'
                                        )}
                                    </p>
                                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                        <FolderOpen className="mr-1 h-4 w-4" />
                                        <span>Manage</span>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}

            <CreateOrganizationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {editingOrg && (
                <EditOrganizationModal
                    isOpen={!!editingOrg}
                    onClose={() => setEditingOrg(null)}
                    organization={editingOrg}
                />
            )}

            {deletingOrg && (
                <DeleteOrganizationModal
                    isOpen={!!deletingOrg}
                    onClose={() => setDeletingOrg(null)}
                    organization={deletingOrg}
                />
            )}
        </div>
    );
}
