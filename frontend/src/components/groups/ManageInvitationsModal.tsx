'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useGlobalToast } from '@/components/ui/Toast';
import { Invitation } from '@/types';
import { Trash2, Copy, Check, Lock, Unlock, Edit2 } from 'lucide-react';
import api from '@/lib/api';

const AVAILABLE_FIELDS = [
    {
        category: 'Essential',
        fields: [
            { id: 'firstName', label: 'First Name' },
            { id: 'lastName', label: 'Last Name' },
        ],
    },
    {
        category: 'Contact',
        fields: [
            { id: 'phone', label: 'Phone Number' },
            { id: 'email', label: 'Email Address' },
        ],
    },
    {
        category: 'Personal',
        fields: [
            { id: 'dateOfBirth', label: 'Date of Birth' },
            { id: 'nickname', label: 'Nickname' },
            { id: 'tag', label: 'Tag/Category' },
        ],
    },
    {
        category: 'Professional',
        fields: [
            { id: 'organization', label: 'Organization' },
            { id: 'jobTitle', label: 'Job Title' },
        ],
    },
    {
        category: 'Location',
        fields: [
            { id: 'address', label: 'Address' },
            { id: 'city', label: 'City' },
            { id: 'country', label: 'Country' },
        ],
    },
];

interface ManageInvitationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
}

export function ManageInvitationsModal({ isOpen, onClose, groupId }: ManageInvitationsModalProps) {
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [editingInvitationId, setEditingInvitationId] = useState<string | null>(null);
    const [editingRequiredFields, setEditingRequiredFields] = useState<string[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    const editFieldsMutation = useMutation({
        mutationFn: async ({ invitationId, requiredFields }: { invitationId: string; requiredFields: string[] }) => {
            if (requiredFields.length === 0) {
                throw new Error('Select at least one required field');
            }
            await api.patch(`/groups/${groupId}/invitation/${invitationId}`, {
                requiredFields,
            });
        },
        onSuccess: () => {
            success('Fields updated');
            queryClient.invalidateQueries({ queryKey: ['invitations', groupId] });
            setEditingInvitationId(null);
            setIsEditModalOpen(false);
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to update fields');
        },
    });

    const handleOpenEditModal = (invitationId: string, currentFields: string | string[] = []) => {
        setEditingInvitationId(invitationId);
        // Parse currentFields if it's a string
        let fields = currentFields;
        if (typeof fields === 'string') {
            fields = fields.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
        }
        setEditingRequiredFields(fields && fields.length > 0 ? fields : []);
        setIsEditModalOpen(true);
    };

    const handleFieldToggle = (fieldId: string) => {
        setEditingRequiredFields((prev) =>
            prev.includes(fieldId)
                ? prev.filter((f) => f !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleCopy = async (slug: string) => {
        const url = `${window.location.origin}/invite/${slug}`;

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for missing clipboard API (e.g. non-HTTPS, or some mobile browsers)
                const textArea = document.createElement("textarea");
                textArea.value = url;

                // Avoid scrolling to bottom
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }

                document.body.removeChild(textArea);
            }

            setCopiedId(slug);
            success('Link copied to clipboard');
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
            error('Failed to copy link');
        }
    };

    return (
        <>
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
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
                                                    onClick={() => handleOpenEditModal(inv.id, inv.requiredFields)}
                                                    title="Edit fields"
                                                >
                                                    <Edit2 className="h-4 w-4" />
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
                                        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                                            <div>
                                                {inv.allowDownload ? (
                                                    <span className="text-green-600">✓ Download enabled</span>
                                                ) : (
                                                    <span className="text-red-600">✗ Download disabled</span>
                                                )}
                                            </div>
                                            {inv.allowDownload && (
                                                <div className="text-blue-600">
                                                    💡 Contact selection available (use GenerateInvitationButton to edit)
                                                </div>
                                            )}
                                            {inv.expiresAt && !inv.isExpired && (
                                                <div>
                                                    Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                                                </div>
                                            )}
                                            {inv.isExpired && (
                                                <div className="text-red-600">Expired</div>
                                            )}
                                            {inv.requiredFields && (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    <span className="font-medium">Collects:</span>
                                                    {(() => {
                                                        // Parse requiredFields if it's a string
                                                        let fields = inv.requiredFields;
                                                        if (typeof fields === 'string') {
                                                            fields = fields.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
                                                        }
                                                        return (fields || []).map((field: string) => (
                                                            <span
                                                                key={field}
                                                                className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs"
                                                            >
                                                                {field}
                                                            </span>
                                                        ));
                                                    })()}
                                                </div>
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

            {/* Edit Fields Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Required Fields">
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {AVAILABLE_FIELDS.map((category) => (
                        <div key={category.category} className="mb-6">
                            <h4 className="text-sm font-medium mb-3 text-muted-foreground">{category.category}</h4>
                            <div className="space-y-2">
                                {category.fields.map((field) => (
                                    <label
                                        key={field.id}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={editingRequiredFields.includes(field.id)}
                                            onChange={() => handleFieldToggle(field.id)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">{field.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-3 mt-6 mb-4">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            You must select at least one required field.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (editingInvitationId) {
                                    editFieldsMutation.mutate({
                                        invitationId: editingInvitationId,
                                        requiredFields: editingRequiredFields,
                                    });
                                }
                            }}
                            disabled={editFieldsMutation.isPending || editingRequiredFields.length === 0}
                        >
                            {editFieldsMutation.isPending ? 'Updating...' : 'Update Fields'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
