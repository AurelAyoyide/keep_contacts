'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGlobalToast } from '@/components/ui/Toast';
import { ExportTokensList } from './ExportTokensList';
import api from '@/lib/api';

interface ManageExportTokensModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
}

export function ManageExportTokensModal({ isOpen, onClose, groupId }: ManageExportTokensModalProps) {
    const [format, setFormat] = useState<'csv' | 'vcf'>('csv');
    const [hours, setHours] = useState(24);
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useGlobalToast();
    const queryClient = useQueryClient();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post(`/groups/${groupId}/export/token`, {
                format,
                expiresInHours: Number(hours)
            });

            success('Export token generated');
            queryClient.invalidateQueries({ queryKey: ['exportTokens', groupId] });
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to generate token');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Manage Export Tokens"
        >
            <div className="space-y-6">
                {/* Generate Form */}
                <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3 text-sm">Generate New Token</h4>
                    <form onSubmit={handleGenerate} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium mb-1 block">Format</label>
                                <select
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value as 'csv' | 'vcf')}
                                >
                                    <option value="csv">CSV (Spreadsheet)</option>
                                    <option value="vcf">VCF (Contacts)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Expires in (Hours)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={hours}
                                    onChange={(e) => setHours(Number(e.target.value))}
                                    className="h-9"
                                />
                            </div>
                        </div>
                        <Button type="submit" size="sm" className="w-full" isLoading={isLoading}>
                            Generate Secure Link
                        </Button>
                    </form>
                </div>

                {/* List */}
                <div>
                    <h4 className="font-medium mb-3 text-sm">Active Tokens</h4>
                    <ExportTokensList groupId={groupId} />
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
}
