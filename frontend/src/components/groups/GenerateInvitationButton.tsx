'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useGlobalToast } from '@/components/ui/Toast';
import { Link2, Copy, Check } from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';

interface GenerateInvitationButtonProps {
    groupId: string;
    existingSlug?: string; // If we already have one
}

export function GenerateInvitationButton({ groupId, existingSlug }: GenerateInvitationButtonProps) {
    const [slug, setSlug] = useState<string | null>(existingSlug || null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { success, error } = useGlobalToast();

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.post(`/groups/${groupId}/invitation`);
            setSlug(data.slug);
            success('Invitation link generated!');
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
        <Button onClick={handleGenerate} isLoading={isLoading} size="sm" variant="outline" className="w-full sm:w-auto">
            <Link2 className="mr-2 h-4 w-4" />
            Generate Invitation Link
        </Button>
    );
}
