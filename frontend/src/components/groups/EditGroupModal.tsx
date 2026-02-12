'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGlobalToast } from '@/components/ui/Toast';
import { Group } from '@/types';
import api from '@/lib/api';

interface EditGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group | null;
    orgId: string;
}

export function EditGroupModal({ isOpen, onClose, group, orgId }: EditGroupModalProps) {
    const [name, setName] = useState(group?.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!group) return;

        setIsLoading(true);

        try {
            await api.patch(`/groups/${group.id}`, {
                name,
            });

            success('Group updated successfully');
            queryClient.invalidateQueries({ queryKey: ['group', group.id] });
            queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
            onClose();
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to update group');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Group"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Group Name"
                    placeholder="e.g. Sales Team"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
