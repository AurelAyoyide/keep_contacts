'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus, Settings, Trash2, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';
import { EditOrganizationModal } from '@/components/organizations/EditOrganizationModal';
import { DeleteOrganizationModal } from '@/components/organizations/DeleteOrganizationModal';
import { useGlobalToast } from '@/components/ui/Toast';
import { Organization, Group } from '@/types';
import api from '@/lib/api';

// Extended type including groups
interface OrganizationWithGroups extends Organization {
    groups: Group[];
}

export default function OrganizationDetailsPage() {
    const params = useParams();
    const id = params.orgId as string;
    const router = useRouter();
    const { success, error } = useGlobalToast();

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: organization, isLoading } = useQuery({
        queryKey: ['organization', id],
        queryFn: async () => {
            const { data } = await api.get<OrganizationWithGroups>(`/organizations/${id}`);
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

    if (!organization) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold">Organization not found</h3>
                <Link href="/dashboard">
                    <Button variant="link">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/dashboard" className="hover:text-foreground flex items-center">
                            <ArrowLeft className="mr-1 h-3 w-3" /> Organizations
                        </Link>
                        <span>/</span>
                        <span>{organization.name}</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{organization.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {organization.autoTag && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                                Auto-tag: {organization.autoTag}
                                {organization.tagEnabled === false && ' (disabled)'}
                            </span>
                        )}
                        <span>Created {new Date(organization.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" /> Settings
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Org
                    </Button>
                    <Button onClick={() => setIsGroupModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Group
                    </Button>
                </div>
            </div>

            {/* Groups List */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Groups</h3>

                {!organization.groups || organization.groups.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
                        <div className="rounded-full bg-muted p-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h4 className="mt-4 text-lg font-medium">No groups yet</h4>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            Create a group to start organizing contacts within this organization.
                        </p>
                        <Button className="mt-6" variant="outline" onClick={() => setIsGroupModalOpen(true)}>
                            Create First Group
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {organization.groups.map((group) => (
                            <Link
                                key={group.id}
                                href={`/dashboard/organizations/${organization.id}/groups/${group.id}`}
                            >
                                <Card variant="clickable" className="h-full p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                                            <Users className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-semibold">{group.name}</h4>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        View contacts and manage settings
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                organizationId={organization.id}
            />

            <EditOrganizationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                organization={organization}
            />

            <DeleteOrganizationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                organization={organization}
            />
        </div>
    );
}
