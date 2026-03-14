'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExportToken } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Copy, Trash2, Clock, Check } from 'lucide-react';
import { useGlobalToast } from '@/components/ui/Toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils'; // Assuming utils exists

interface ExportTokensListProps {
    groupId: string;
}

export function ExportTokensList({ groupId }: ExportTokensListProps) {
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { data: tokens, isLoading } = useQuery({
        queryKey: ['exportTokens', groupId],
        queryFn: async () => {
            const { data } = await api.get<ExportToken[]>(`/groups/${groupId}/export/tokens`);
            return data;
        },
    });

    const revokeMutation = useMutation({
        mutationFn: async (tokenId: string) => {
            await api.post(`/groups/${groupId}/export/tokens/${tokenId}/revoke`);
        },
        onSuccess: () => {
            success('Token revoked');
            queryClient.invalidateQueries({ queryKey: ['exportTokens', groupId] });
        },
        onError: (err: any) => {
            error(err.response?.data?.message || 'Failed to revoke token');
        },
    });

    const handleCopy = async (token: ExportToken) => {
        // Construct URL: GET /export?token=...
        const url = `${api.defaults.baseURL}/export?token=${token.token}`;

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for missing clipboard API (e.g. non-HTTPS, or some mobile browsers)
                const textArea = document.createElement("textarea");
                textArea.value = url;

                // Avoid scrolling to bottom
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }

                document.body.removeChild(textArea);
            }

            setCopiedId(token.id);
            success('Download link copied');
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
            error('Failed to copy link');
        }
    };

    if (isLoading) return <Spinner />;

    if (!tokens || tokens.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No active export tokens.</p>;
    }

    return (
        <div className="space-y-3">
            {tokens.map((token) => {
                const isExpired = new Date(token.expiresAt) < new Date();
                return (
                    <div key={token.id} className="flex items-center justify-between p-3 border rounded-lg bg-card text-sm">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-medium">
                                <span className="uppercase bg-muted px-1.5 py-0.5 rounded text-xs">{token.format}</span>
                                <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">{token.token.substring(0, 12)}...</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {isExpired ? 'Expired' : `Expires ${new Date(token.expiresAt).toLocaleDateString()}`}
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(token)}>
                                {copiedId === token.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    if (confirm('Revoke this token?')) revokeMutation.mutate(token.id);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
