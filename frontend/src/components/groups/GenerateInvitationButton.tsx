'use client';

import { useState } from 'react';
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

export function GenerateInvitationButton({ groupId, existingSlug }: GenerateInvitationButtonProps) {
    const [slug, setSlug] = useState<string | null>(existingSlug || null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allowDownload, setAllowDownload] = useState(true);
    const [expiresInHours, setExpiresInHours] = useState<number | ''>('');
    const { success, error } = useGlobalToast();

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.post(`/groups/${groupId}/invitation`, {
                allowDownload,
                expiresInHours: expiresInHours ? parseInt(expiresInHours as string) : undefined,
            });
            setSlug(data.slug);
            success('Invitation link generated!');
            setIsModalOpen(false);
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to generate invitation');
        } finally {
            setIsLoading(false);
        }
    };

    const invitationUrl = slug ? `${window.location.origin}/invite/${slug}` : '';

    const handleCopy = () => {
        if (!invitationUrl) return;
        navigator.clipboard.writeText(invitationUrl);
        setCopied(true);
        success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    if (slug) {
        return (
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
                onClose={() => setIsModalOpen(false)}
                title="Configure Invitation Link"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="allowDownload"
                            checked={allowDownload}
                            onChange={(e) => setAllowDownload(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <label htmlFor="allowDownload" className="text-sm font-medium cursor-pointer">
                            Allow download of contacts (VCF)
                        </label>
                    </div>

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

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsModalOpen(false)} 
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleGenerate} 
                            isLoading={isLoading}
                        >
                            Generate Link
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
