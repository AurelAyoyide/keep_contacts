'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useGlobalToast } from '@/components/ui/Toast';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { success, error } = useGlobalToast();

    const [showResend, setShowResend] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setShowResend(false);

        try {
            const { data } = await api.post('/auth/login', { email, password });

            const accessToken = data.accessToken;
            const refreshToken = data.refreshToken;

            if (!accessToken || !refreshToken) {
                throw new Error('No token received');
            }

            // Fetch user details immediately to populate context
            api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

            // To fetch me, we manually pass the auth header since the interceptor relies on localStorage
            const userResponse = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            login(accessToken, refreshToken, userResponse.data);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || 'Invalid credentials';
            error(msg.toString());

            // If the user needs to verify their email
            if (msg.includes('vérifier') || msg.includes('verify')) {
                setShowResend(true);
            }

            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            const res = await api.post('/auth/resend-verification', { email });
            success(res.data.message || 'Email de vérification renvoyé avec succès');
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to resend email');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                    <p className="mt-2 text-muted-foreground">Sign in to your account</p>
                </div>

                <Card className="p-8">
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

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            leftIcon={<Lock className="h-4 w-4" />}
                        />

                        <div className="flex items-center justify-between mt-2">
                            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign In
                        </Button>

                        {showResend && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full mt-2"
                                onClick={handleResendVerification}
                            >
                                Resend verification email
                            </Button>
                        )}
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link href="/register" className="font-medium text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
