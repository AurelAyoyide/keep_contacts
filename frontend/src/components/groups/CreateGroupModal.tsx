'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGlobalToast } from '@/components/ui/Toast';
import api from '@/lib/api';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
}

export function CreateGroupModal({ isOpen, onClose, organizationId }: CreateGroupModalProps) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/groups', {
                name,
                organizationId
            });

            success('Group created successfully');
            queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
            onClose();
            setName('');
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to create group');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Group"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Group Name"
                    placeholder="e.g. Class 2024"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Create
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
