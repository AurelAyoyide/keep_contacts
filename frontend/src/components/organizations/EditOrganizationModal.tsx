'use client';

import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGlobalToast } from '@/components/ui/Toast';
import { Organization } from '@/types';
import api from '@/lib/api';

interface EditOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization | null;
}

export function EditOrganizationModal({ isOpen, onClose, organization }: EditOrganizationModalProps) {
    const [name, setName] = useState('');
    const [autoTag, setAutoTag] = useState('');
    const [tagEnabled, setTagEnabled] = useState(true);
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();

    // Update form state when modal opens or organization changes
    useEffect(() => {
        if (isOpen && organization) {
            setName(organization.name || '');
            setAutoTag(organization.autoTag || '');
            setTagEnabled(organization.tagEnabled ?? true);
        }
    }, [isOpen, organization]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!organization) throw new Error('No organization');
            await api.patch(`/organizations/${organization.id}`, {
                name: name || undefined,
                autoTag: autoTag || undefined,
                tagEnabled,
            });
        },
        onSuccess: () => {
            success('Organization updated successfully');
            if (organization) {
                queryClient.invalidateQueries({ queryKey: ['organization', organization.id] });
                queryClient.invalidateQueries({ queryKey: ['organizations'] });
            }
            // Close modal after successful update
            setTimeout(() => onClose(), 500);
        },
        onError: (err: any) => {
            console.error(err);
            error(err.response?.data?.message || 'Failed to update organization');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization || !name.trim()) {
            error('Organization name is required');
            return;
        }
        updateMutation.mutate();
    };

    if (!organization) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit ${organization.name}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Organization Name"
                    placeholder="e.g. Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <Input
                    label="Auto Tag (Optional)"
                    placeholder="e.g. Employee"
                    value={autoTag}
                    onChange={(e) => setAutoTag(e.target.value)}
                />

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="tagEnabled"
                        checked={tagEnabled}
                        onChange={(e) => setTagEnabled(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                    <label htmlFor="tagEnabled" className="text-sm font-medium cursor-pointer">
                        Enable auto-tag for contacts
                    </label>
                </div>

                <p className="text-xs text-muted-foreground">
                    When enabled, the auto-tag will be appended to contact tags during export (e.g., "VIP - Employee")
                </p>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={updateMutation.isPending}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
