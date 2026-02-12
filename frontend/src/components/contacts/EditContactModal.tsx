'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Contact } from '@/types';
import api from '@/lib/api';
import { useGlobalToast } from '@/components/ui/Toast';

interface EditContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: Contact;
    groupId: string;
}

export function EditContactModal({ isOpen, onClose, contact, groupId }: EditContactModalProps) {
    const queryClient = useQueryClient();
    const { success, error } = useGlobalToast();

    const [firstName, setFirstName] = useState(contact.firstName);
    const [lastName, setLastName] = useState(contact.lastName);
    const [phone, setPhone] = useState(contact.phone);
    const [email, setEmail] = useState(contact.email || '');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [countryCode, setCountryCode] = useState(contact.countryCode || 'BJ'); // Default to Benin
    const [tag, setTag] = useState(contact.tag || '');

    useEffect(() => {
        if (isOpen) {
            setFirstName(contact.firstName);
            setLastName(contact.lastName);
            setPhone(contact.phone);
            setEmail(contact.email || '');
            setCountryCode(contact.countryCode || 'BJ'); // Default to Benin
            setTag(contact.tag || '');
            // Convert ISO8601 date to YYYY-MM-DD format for date input
            if (contact.dateOfBirth) {
                const date = new Date(contact.dateOfBirth);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                setDateOfBirth(`${year}-${month}-${day}`);
            } else {
                setDateOfBirth('');
            }
        }
    }, [isOpen, contact]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            await api.patch(`/contacts/${contact.id}`, {
                firstName,
                lastName,
                phone,
                email: email || undefined,
                countryCode,
                tag: tag || undefined,
                dateOfBirth: dateOfBirth || null,
            });
        },
        onSuccess: () => {
            success('Contact updated successfully');
            queryClient.invalidateQueries({ queryKey: ['contacts', groupId] });
            onClose();
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to update contact');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Contact">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <Input
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <PhoneInput
                        label="Numéro de téléphone"
                        countryCode={countryCode}
                        phoneNumber={phone}
                        onCountryChange={setCountryCode}
                        onPhoneChange={setPhone}
                    />
                </div>

                <Input
                    label="Email (Optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    label="Date of Birth (Optional)"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                />

                <Input
                    label="Tag (Optional)"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g., VIP, Friend, Family"
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button isLoading={updateMutation.isPending} type="submit">
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
