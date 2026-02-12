'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGlobalToast } from '@/components/ui/Toast';
import api from '@/lib/api';

interface CreateOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateOrganizationModal({ isOpen, onClose }: CreateOrganizationModalProps) {
    const [name, setName] = useState('');
    const [autoTag, setAutoTag] = useState('');
    const [tagEnabled, setTagEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/organizations', {
                name,
                autoTag: autoTag || undefined,
                tagEnabled,
            });

            success('Organization created successfully');
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            onClose();
            setName('');
            setAutoTag('');
            setTagEnabled(true);
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to create organization');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Organization"
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
