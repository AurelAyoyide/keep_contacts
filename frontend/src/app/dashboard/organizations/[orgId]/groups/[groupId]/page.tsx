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
import { ContactsTable } from '@/components/contacts/ContactsTable';
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
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState<'csv' | 'vcf' | null>(null);

    const handleDownload = async (format: 'csv' | 'vcf') => {
        setIsDownloading(format);
        try {
            const response = await api.get(`/groups/${groupId}/export/${format}`, {
                responseType: 'blob',
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Try to extract filename from header
            const contentDisposition = response.headers['content-disposition'];
            let filename = `contacts.${format}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            success(`Download ${format.toUpperCase()} success`);
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
                        onEdit={(contact) => console.log('Edit', contact)} // To implement
                        onDelete={(contact) => {
                            if (confirm('Delete this contact?')) {
                                deleteContactMutation.mutate(contact.id);
                            }
                        }}
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
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Export Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Download your contacts or generate a secure share link.
                        </p>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start"
                                onClick={() => handleDownload('csv')}
                                isLoading={isDownloading === 'csv'}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download CSV
                            </Button>
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

            <ManageExportTokensModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                groupId={groupId}
            />
        </div>
    );
}
