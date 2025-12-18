'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useGlobalToast } from '@/components/ui/Toast';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { error } = useGlobalToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            // Expecting { user: {...}, token: '...' } or similar. 
            // Based on typical NestJS passport-jwt, it might be { access_token: '...' }
            // I need to be sure about the response structure. 
            // Let's assume standard { accessToken: '...' } or verify. 
            // The backend README says:
            // POST /auth/login -> Connexion

            // If the backend returns just the token, I might need to fetch user profile or it returns both.
            // Usually NestJS example returns { access_token: string }

            const token = data.access_token || data.token;

            if (!token) {
                throw new Error('No token received');
            }

            // If useAuth requires user object immediately, I might need to decode token or fetch me.
            // The AuthContext I wrote fetches /auth/me on mount if token exists.
            // But for fast transition, I should probably fetch me here or let the dashboard do it?
            // AuthProvider.login takes (token, user).

            // Let's fetch user details
            api.defaults.headers.Authorization = `Bearer ${token}`; // Set temporarily
            const userResponse = await api.get('/auth/me');

            login(token, userResponse.data);
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Invalid credentials');
            setIsLoading(false);
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

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign In
                        </Button>
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
