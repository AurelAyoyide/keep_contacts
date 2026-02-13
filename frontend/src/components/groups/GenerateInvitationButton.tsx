'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useGlobalToast } from '@/components/ui/Toast';
import { Link2, Copy, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

interface GenerateInvitationButtonProps {
    groupId: string;
    existingSlug?: string;
}

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

export function GenerateInvitationButton({ groupId, existingSlug }: GenerateInvitationButtonProps) {
    const [slug, setSlug] = useState<string | null>(existingSlug || null);
    const [invitationId, setInvitationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [allowDownload, setAllowDownload] = useState(true);
    const [expiresInHours, setExpiresInHours] = useState<number | ''>('');
    const [requiredFields, setRequiredFields] = useState<string[]>(['firstName', 'lastName', 'phone']);
    const [currentInvitationData, setCurrentInvitationData] = useState<{requiredFields: string[], allowDownload: boolean} | null>(null);
    const { success, error } = useGlobalToast();

    const handleFieldToggle = (fieldId: string) => {
        setRequiredFields((prev) =>
            prev.includes(fieldId)
                ? prev.filter((f) => f !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleGenerate = async () => {
        if (requiredFields.length === 0) {
            error('Select at least one required field');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post(`/groups/${groupId}/invitation`, {
                allowDownload,
                expiresInHours: expiresInHours ? parseInt(String(expiresInHours)) : undefined,
                requiredFields,
            });
            setSlug(data.slug);
            setInvitationId(data.id);
            // Store the data we just created so we can use it in edit mode
            setCurrentInvitationData({
                requiredFields,
                allowDownload,
            });
            success('Invitation link generated!');
            setIsModalOpen(false);
            setIsEditMode(false);
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to generate invitation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (requiredFields.length === 0) {
            error('Select at least one required field');
            return;
        }

        if (!invitationId) return;

        setIsLoading(true);
        try {
            await api.patch(`/groups/${groupId}/invitation/${invitationId}`, {
                requiredFields,
            });
            // Update cached data
            setCurrentInvitationData({
                requiredFields,
                allowDownload: allowDownload !== false,
            });
            success('Invitation updated!');
            setIsEditMode(false);
            setIsModalOpen(false);
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to update invitation');
        } finally {
            setIsLoading(false);
        }
    };

    const loadInvitationData = async (invId: string) => {
        // If we just created this invitation, use the data we already have
        if (currentInvitationData) {
            setRequiredFields(currentInvitationData.requiredFields);
            setAllowDownload(currentInvitationData.allowDownload);
            return;
        }

        // Otherwise, fetch from server
        setIsFetchingData(true);
        try {
            const { data: invitations } = await api.get(`/groups/${groupId}/invitations`);
            const currentInv = invitations.find((inv: any) => inv.id === invId);
            
            if (currentInv) {
                console.log('Loaded invitation data:', currentInv);
                // Parse requiredFields if it's a string
                let fields = currentInv.requiredFields;
                if (typeof fields === 'string') {
                    fields = fields.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
                }
                const fieldsArray = fields || ['firstName', 'lastName', 'phone'];
                setRequiredFields(fieldsArray);
                setAllowDownload(currentInv.allowDownload !== false);
                // Cache the data
                setCurrentInvitationData({
                    requiredFields: fieldsArray,
                    allowDownload: currentInv.allowDownload !== false,
                });
            } else {
                console.warn('Invitation not found in list:', invId);
                error('Invitation not found');
            }
        } catch (err: any) {
            console.error('Failed to load invitation data:', err);
            error('Failed to load invitation settings');
        } finally {
            setIsFetchingData(false);
        }
    };

    const handleCopy = () => {
        if (!slug) return;
        const invitationUrl = `${window.location.origin}/invite/${slug}`;
        navigator.clipboard.writeText(invitationUrl);
        setCopied(true);
        success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    // Load invitation data when modal opens in edit mode
    useEffect(() => {
        if (isModalOpen && isEditMode && invitationId && !isFetchingData) {
            console.log('Opening edit mode, loading data for invitation:', invitationId);
            loadInvitationData(invitationId);
        }
    }, [isModalOpen, isEditMode]);

    if (slug) {
        const invitationUrl = `${window.location.origin}/invite/${slug}`;
        return (
            <>
                <div className="space-y-2">
                    <div className="flex w-full items-center gap-2">
                        <Input
                            readOnly
                            value={invitationUrl}
                            className="bg-muted font-mono text-xs"
                        />
                        <Button size="icon" variant="outline" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Button 
                        onClick={() => {
                            setIsEditMode(true);
                            setIsModalOpen(true);
                        }} 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                    >
                        Edit Fields & Settings
                    </Button>
                </div>

                {/* Modal for editing */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setIsEditMode(false);
                        setRequiredFields(['firstName', 'lastName', 'phone']);
                        setAllowDownload(true);
                        setExpiresInHours('');
                    }}
                    title={isEditMode ? "Edit Required Fields" : "Configure Invitation Link"}
                >
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {/* Required Fields Selection - Grouped by Category */}
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                {isEditMode ? "Which fields should be required?" : "Which information do you want to collect?"}
                            </label>
                            <div className="space-y-4">
                                {AVAILABLE_FIELDS.map((category) => (
                                    <div key={category.category} className="space-y-2">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {category.category}
                                        </h3>
                                        <div className="pl-2 space-y-2 p-2 bg-muted rounded-lg">
                                            {category.fields.map((field) => (
                                                <div key={field.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={field.id}
                                                        checked={requiredFields.includes(field.id)}
                                                        onChange={() => handleFieldToggle(field.id)}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <label htmlFor={field.id} className="text-sm font-medium cursor-pointer">
                                                        {field.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                {isEditMode 
                                    ? "Users must provide these fields to submit the form" 
                                    : "Fields marked as required must be provided by users"}
                            </p>
                        </div>

                        {/* Only show these options when creating new invitation */}
                        {!isEditMode && (
                            <>
                                {/* Allow Download */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="allowDownload"
                                        checked={allowDownload}
                                        onChange={(e) => setAllowDownload(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="allowDownload" className="text-sm font-medium cursor-pointer">
                                        Allow users to download contacts (VCF)
                                    </label>
                                </div>

                                {/* Expiration */}
                                <div>
                                    <label htmlFor="expiresInHours" className="block text-sm font-medium mb-2">
                                        Expiration (optional)
                                    </label>
                                    <Input
                                        id="expiresInHours"
                                        type="number"
                                        placeholder="Leave empty for no expiration"
                                        value={expiresInHours}
                                        onChange={(e) => setExpiresInHours(e.target.value === '' ? '' : parseInt(e.target.value))}
                                        min="1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Enter hours until the link expires
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsEditMode(false);
                                }} 
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button" 
                                onClick={isEditMode ? handleUpdate : handleGenerate} 
                                isLoading={isLoading}
                                disabled={requiredFields.length === 0}
                            >
                                {isEditMode ? "Update Fields" : "Generate Link"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </>
        );
    }

    return (
        <>
            <Button 
                onClick={() => setIsModalOpen(true)} 
                size="sm" 
                variant="outline" 
                className="w-full sm:w-auto"
            >
                <Link2 className="mr-2 h-4 w-4" />
                Generate Invitation Link
            </Button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setRequiredFields(['firstName', 'lastName', 'phone']);
                    setAllowDownload(true);
                    setExpiresInHours('');
                }}
                title={isEditMode ? "Edit Required Fields" : "Configure Invitation Link"}
            >
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Required Fields Selection - Grouped by Category */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            {isEditMode ? "Which fields should be required?" : "Which information do you want to collect?"}
                        </label>
                        <div className="space-y-4">
                            {AVAILABLE_FIELDS.map((category) => (
                                <div key={category.category} className="space-y-2">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        {category.category}
                                    </h3>
                                    <div className="pl-2 space-y-2 p-2 bg-muted rounded-lg">
                                        {category.fields.map((field) => (
                                            <div key={field.id} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={field.id}
                                                    checked={requiredFields.includes(field.id)}
                                                    onChange={() => handleFieldToggle(field.id)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor={field.id} className="text-sm font-medium cursor-pointer">
                                                    {field.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            {isEditMode 
                                ? "Users must provide these fields to submit the form" 
                                : "Fields marked as required must be provided by users"}
                        </p>
                    </div>

                    {/* Only show these options when creating new invitation */}
                    {!isEditMode && (
                        <>
                            {/* Allow Download */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="allowDownload"
                                    checked={allowDownload}
                                    onChange={(e) => setAllowDownload(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="allowDownload" className="text-sm font-medium cursor-pointer">
                                    Allow users to download contacts (VCF)
                                </label>
                            </div>

                            {/* Expiration */}
                            <div>
                                <label htmlFor="expiresInHours" className="block text-sm font-medium mb-2">
                                    Expiration (optional)
                                </label>
                                <Input
                                    id="expiresInHours"
                                    type="number"
                                    placeholder="Leave empty for no expiration"
                                    value={expiresInHours}
                                    onChange={(e) => setExpiresInHours(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    min="1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Enter hours until the link expires
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                                setIsModalOpen(false);
                                setIsEditMode(false);
                            }} 
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            onClick={isEditMode ? handleUpdate : handleGenerate} 
                            isLoading={isLoading}
                            disabled={requiredFields.length === 0}
                        >
                            {isEditMode ? "Update Fields" : "Generate Link"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
