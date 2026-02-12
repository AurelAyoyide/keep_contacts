'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Organization } from '@/types';
import api from '@/lib/api';
import { useGlobalToast } from '@/components/ui/Toast';

interface DeleteOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization;
}

export function DeleteOrganizationModal({ isOpen, onClose, organization }: DeleteOrganizationModalProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { success, error } = useGlobalToast();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/organizations/${organization.id}`);
        },
        onSuccess: () => {
            success('Organization deleted successfully');
            // Close modal first
            onClose();
            // Then invalidate and redirect
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            setTimeout(() => {
                router.push('/dashboard');
            }, 300);
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to delete organization');
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Organization">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete <strong>{organization.name}</strong>? All groups and contacts in this organization will be permanently deleted. This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose} type="button" disabled={deleteMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        isLoading={deleteMutation.isPending}
                        onClick={handleDelete}
                    >
                        Delete Organization
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
