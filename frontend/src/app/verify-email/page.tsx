'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token invalide ou manquant.');
            return;
        }

        const verify = async () => {
            try {
                const res = await api.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(res.data.message || 'Email vérifié avec succès !');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'La vérification a échoué. Le lien est peut-être expiré.');
            }
        };

        verify();
    }, [token]);

    return (
        <Card className="w-full max-w-md p-8 text-center space-y-6">
            {status === 'loading' && (
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <h2 className="text-xl font-semibold">Vérification de votre email...</h2>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center space-y-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <h2 className="text-xl font-semibold">Email vérifié !</h2>
                    <p className="text-muted-foreground">{message}</p>
                    <Button className="w-full mt-4" onClick={() => router.push('/login')}>
                        Se connecter
                    </Button>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center space-y-4">
                    <XCircle className="h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-semibold">Erreur de vérification</h2>
                    <p className="text-muted-foreground">{message}</p>
                    <Link href="/login" className="w-full mt-4">
                        <Button variant="outline" className="w-full">
                            Retour à la connexion
                        </Button>
                    </Link>
                </div>
            )}
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Suspense fallback={<Card className="w-full max-w-md p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></Card>}>
                <VerifyEmailForm />
            </Suspense>
        </div>
    );
}
