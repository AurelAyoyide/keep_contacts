'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSubmitted(true);
        } catch (err: any) {
            console.error(err);
            // By design, always succeed to avoid enumeration
            setIsSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Mot de passe oublié</h2>
                    <p className="mt-2 text-muted-foreground">
                        Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                <Card className="p-8">
                    {isSubmitted ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-100 text-green-800 p-4 rounded-md">
                                Si un compte correspond à cette adresse, un email de réinitialisation vient de vous être envoyé.
                            </div>
                            <p className="text-sm text-muted-foreground">
                                N'oubliez pas de vérifier vos spams.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                leftIcon={<Mail className="h-4 w-4" />}
                            />

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Envoyer le lien
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}
