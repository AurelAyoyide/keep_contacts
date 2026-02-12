'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Contact } from '@/types';
import api from '@/lib/api';
import { useGlobalToast } from '@/components/ui/Toast';

interface DeleteContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: Contact;
    groupId: string;
}

export function DeleteContactModal({ isOpen, onClose, contact, groupId }: DeleteContactModalProps) {
    const queryClient = useQueryClient();
    const { success, error } = useGlobalToast();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/contacts/${contact.id}`);
        },
        onSuccess: () => {
            success('Contact deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['contacts', groupId] });
            onClose();
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to delete contact');
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Contact">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete <strong>{contact.firstName} {contact.lastName}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        isLoading={deleteMutation.isPending}
                        onClick={handleDelete}
                    >
                        Delete Contact
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
