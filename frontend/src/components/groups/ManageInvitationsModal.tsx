'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useGlobalToast } from '@/components/ui/Toast';
import { Invitation } from '@/types';
import { Trash2, Copy, Check, Lock, Unlock } from 'lucide-react';
import api from '@/lib/api';

interface ManageInvitationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
}

export function ManageInvitationsModal({ isOpen, onClose, groupId }: ManageInvitationsModalProps) {
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { data: invitations, isLoading } = useQuery({
        queryKey: ['invitations', groupId],
        queryFn: async () => {
            const { data } = await api.get<(Invitation & { isExpired?: boolean })[]>(
                `/groups/${groupId}/invitations`
            );
            return data;
        },
        enabled: isOpen,
    });

    const deleteMutation = useMutation({
        mutationFn: async (invitationId: string) => {
            await api.delete(`/groups/${groupId}/invitation/${invitationId}`);
        },
        onSuccess: () => {
            success('Invitation deleted');
            queryClient.invalidateQueries({ queryKey: ['invitations', groupId] });
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to delete invitation');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ invitationId, allowDownload }: { invitationId: string; allowDownload: boolean }) => {
            await api.patch(`/groups/${groupId}/invitation/${invitationId}`, {
                allowDownload,
            });
        },
        onSuccess: () => {
            success('Invitation updated');
            queryClient.invalidateQueries({ queryKey: ['invitations', groupId] });
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to update invitation');
        },
    });

    const handleCopy = (slug: string) => {
        const url = `${window.location.origin}/invite/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedId(slug);
        success('Link copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Manage Invitation Links"
        >
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Spinner />
                    </div>
                ) : !invitations || invitations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No invitation links yet. Create one from the group page.
                    </p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {invitations.map((inv) => (
                            <Card key={inv.id} className="p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {inv.slug.substring(0, 8)}...
                                        </code>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleCopy(inv.slug)}
                                            >
                                                {copiedId === inv.slug ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    updateMutation.mutate({
                                                        invitationId: inv.id,
                                                        allowDownload: !inv.allowDownload,
                                                    })
                                                }
                                                disabled={updateMutation.isPending}
                                            >
                                                {inv.allowDownload ? (
                                                    <Unlock className="h-4 w-4" />
                                                ) : (
                                                    <Lock className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteMutation.mutate(inv.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {inv.allowDownload ? (
                                            <span className="text-green-600">✓ Download enabled</span>
                                        ) : (
                                            <span className="text-red-600">✗ Download disabled</span>
                                        )}
                                        {inv.expiresAt && !inv.isExpired && (
                                            <span>
                                                Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                                            </span>
                                        )}
                                        {inv.isExpired && (
                                            <span className="text-red-600">Expired</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
