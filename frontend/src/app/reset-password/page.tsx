'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useGlobalToast } from '@/components/ui/Toast';
import { Lock, Loader2 } from 'lucide-react';
import api from '@/lib/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useGlobalToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            error('Token invalide ou manquant.');
            return;
        }

        if (password !== confirmPassword) {
            error('Les mots de passe ne correspondent pas');
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', { token, password });
            success('Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.');
            router.push('/login');
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Impossible de réinitialiser le mot de passe');
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <Card className="p-8 text-center max-w-md w-full">
                <h2 className="text-xl font-bold text-red-600 mb-2">Lien invalide</h2>
                <p className="text-muted-foreground mb-4">Le lien de réinitialisation est invalide ou manquant.</p>
                <Link href="/forgot-password">
                    <Button className="w-full">Demander un nouveau lien</Button>
                </Link>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Nouveau mot de passe</h2>
                <p className="mt-2 text-muted-foreground">Créez votre nouveau mot de passe sécurisé</p>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Nouveau mot de passe"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        leftIcon={<Lock className="h-4 w-4" />}
                    />

                    <Input
                        label="Confirmer le mot de passe"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        leftIcon={<Lock className="h-4 w-4" />}
                    />

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Réinitialiser le mot de passe
                    </Button>
                </form>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Suspense fallback={<Card className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></Card>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
