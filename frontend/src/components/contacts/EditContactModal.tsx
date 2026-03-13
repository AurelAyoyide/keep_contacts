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
    const [nickname, setNickname] = useState((contact as any).nickname || '');
    const [organization, setOrganization] = useState((contact as any).organization || '');
    const [jobTitle, setJobTitle] = useState((contact as any).jobTitle || '');
    const [address, setAddress] = useState((contact as any).address || '');
    const [city, setCity] = useState((contact as any).city || '');
    const [country, setCountry] = useState((contact as any).country || '');

    useEffect(() => {
        if (isOpen) {
            setFirstName(contact.firstName);
            setLastName(contact.lastName);
            setPhone(contact.phone);
            setEmail(contact.email || '');
            setCountryCode(contact.countryCode || 'BJ'); // Default to Benin
            setTag(contact.tag || '');
            setNickname((contact as any).nickname || '');
            setOrganization((contact as any).organization || '');
            setJobTitle((contact as any).jobTitle || '');
            setAddress((contact as any).address || '');
            setCity((contact as any).city || '');
            setCountry((contact as any).country || '');
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
                nickname: nickname || undefined,
                organization: organization || undefined,
                jobTitle: jobTitle || undefined,
                address: address || undefined,
                city: city || undefined,
                country: country || undefined,
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
                <div className="max-h-[500px] overflow-y-auto pr-4 space-y-4">
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
                        phoneNumber={phone ?? ''}
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

                <Input
                    label="Nickname (Optional)"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g., 'The Boss'"
                />

                <Input
                    label="Organization (Optional)"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Company or organization name"
                />

                <Input
                    label="Job Title (Optional)"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Manager, Developer"
                />

                <Input
                    label="Address (Optional)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="City (Optional)"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                    />
                    <Input
                        label="Country (Optional)"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                    />
                </div>

                </div>

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
