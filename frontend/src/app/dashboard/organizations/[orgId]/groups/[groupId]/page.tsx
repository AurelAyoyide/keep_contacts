'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Settings, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { GenerateInvitationButton } from '@/components/groups/GenerateInvitationButton';
import { EditGroupModal } from '@/components/groups/EditGroupModal';
import { ManageInvitationsModal } from '@/components/groups/ManageInvitationsModal';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { EditContactModal } from '@/components/contacts/EditContactModal';
import { DeleteContactModal } from '@/components/contacts/DeleteContactModal';
import { useGlobalToast } from '@/components/ui/Toast';
import { Group, Organization, Contact } from '@/types';
import api from '@/lib/api';
import { useState } from 'react';
import { ManageExportTokensModal } from '@/components/exports/ManageExportTokensModal';

export default function GroupDetailsPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const groupId = params.groupId as string;
    const router = useRouter();
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isManageInvitationsOpen, setIsManageInvitationsOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState<'vcf' | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

    const handleDownload = async (format: 'vcf') => {
        setIsDownloading(format);
        try {
            // Create a short-lived export token first
            const { data } = await api.post(`/groups/${groupId}/export/token`, {
                expiresInHours: 1,
                format
            });

            const downloadUrl = `${api.defaults.baseURL}/export?token=${data.token}`;

            const isIOS = /iPhone|iPad|iPod/i.test(
                typeof navigator !== 'undefined' ? navigator.userAgent : ''
            );
            const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i.test(
                typeof navigator !== 'undefined' ? navigator.userAgent : ''
            );

            // iOS Safari only parses the FIRST contact of an inline VCF.
            // For group export (which inherently contains multiple contacts),
            // iOS MUST fall back to a standard file download (attachment).
            if (isMobile && !isIOS) {
                // Inline mode: Android handles the multi-vCard natively
                window.location.href = downloadUrl + '&inline=true';
            } else {
                // Desktop OR iOS Multi-contact: trigger a proper file download
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = '';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            success(`Download ${format.toUpperCase()} initiated`);
        } catch (err: any) {
            console.error('Download error:', err);
            error('Download failed');
        } finally {
            setIsDownloading(null);
        }
    };


    // Fetch Group Details with Organization info and Contacts
    // We might need multiple queries or assumes endpoint returns everything
    // Based on backend readme, /groups/:id returns details. /groups/:id/contacts returns contacts.

    const { data: group, isLoading: isGroupLoading } = useQuery({
        queryKey: ['group', groupId],
        queryFn: async () => {
            const { data } = await api.get<Group>(`/groups/${groupId}`);
            // Find org name if not in group object? 
            // Group object has organizationId. We can fetch org details if needed or just breadcrumb.
            return data;
        },
    });

    const { data: contacts, isLoading: isContactsLoading } = useQuery({
        queryKey: ['contacts', groupId],
        queryFn: async () => {
            const { data } = await api.get<Contact[]>(`/groups/${groupId}/contacts`);
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/groups/${groupId}`);
        },
        onSuccess: () => {
            success('Group deleted successfully');
            router.push(`/dashboard/organizations/${orgId}`);
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to delete group');
        },
    });

    const deleteContactMutation = useMutation({
        mutationFn: async (contactId: string) => {
            await api.delete(`/contacts/${contactId}`);
        },
        onSuccess: () => {
            success('Contact deleted');
            queryClient.invalidateQueries({ queryKey: ['contacts', groupId] });
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to delete contact');
        },
    });

    if (isGroupLoading || isContactsLoading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!group) {
        return <div>Group not found</div>;
    }

    // Assuming invitation slug is in group if generated? 
    // Backend doesn't explicitly say /groups/:id returns current invitation slug.
    // But we have /groups/:id/invitation POST.
    // We might not know if one exists without checking.
    // For now GenerateInvitationButton handles creating one. 

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href={`/dashboard/organizations/${orgId}`} className="hover:text-foreground flex items-center">
                            <ArrowLeft className="mr-1 h-3 w-3" /> Back to Org
                        </Link>
                        <span>/</span>
                        <span>{group.name}</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
                    <div className="text-sm text-muted-foreground">
                        Created {new Date(group.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Group
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content: Contacts */}
                <div className="md:col-span-2 space-y-6">
                    <ContactsTable
                        contacts={contacts || []}
                        onEdit={(contact) => setEditingContact(contact)}
                        onDelete={(contact) => setDeletingContact(contact)}
                    />
                </div>

                {/* Sidebar: Actions */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Invitation Link</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Share this link to collect contacts publicly.
                        </p>
                        <GenerateInvitationButton groupId={groupId} />
                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            size="sm"
                            onClick={() => setIsManageInvitationsOpen(true)}
                        >
                            Manage All Links
                        </Button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Export Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Download your contacts or generate a secure share link.
                        </p>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start"
                                onClick={() => handleDownload('vcf')}
                                isLoading={isDownloading === 'vcf'}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download VCF (vCard)
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Group"
            >
                <div className="space-y-4">
                    <p>Are you sure you want to delete <strong>{group.name}</strong>? All contacts in this group will be deleted.</p>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            isLoading={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate()}
                        >
                            Delete Group
                        </Button>
                    </div>
                </div>
            </Modal>

            <EditGroupModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                group={group}
                orgId={orgId}
            />

            <ManageInvitationsModal
                isOpen={isManageInvitationsOpen}
                onClose={() => setIsManageInvitationsOpen(false)}
                groupId={groupId}
            />

            <ManageExportTokensModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                groupId={groupId}
            />

            {editingContact && (
                <EditContactModal
                    isOpen={!!editingContact}
                    onClose={() => setEditingContact(null)}
                    contact={editingContact}
                    groupId={groupId}
                />
            )}

            {deletingContact && (
                <DeleteContactModal
                    isOpen={!!deletingContact}
                    onClose={() => setDeletingContact(null)}
                    contact={deletingContact}
                    groupId={groupId}
                />
            )}
        </div>
    );
}
