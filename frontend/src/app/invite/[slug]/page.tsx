'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { CountryCodeSelect } from '@/components/ui/CountryCodeSelect';
import { CheckCircle, Users, Building2 } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface InvitationInfo {
    groupName: string;
    organizationName: string;
    slug: string;
}

export default function InvitationPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+229'); // Default to Benin

    const { data: info, isLoading, error: queryError } = useQuery({
        queryKey: ['invitation', slug],
        queryFn: async () => {
            const { data } = await api.get<InvitationInfo>(`/invitation/${slug}`);
            return data;
        },
        retry: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            await api.post('/contacts', {
                slug,
                firstName,
                lastName,
                phone,
                countryCode,
                email: email || undefined,
            });
            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || 'Failed to submit contact');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
                <Spinner size="lg" />
            </div>
        );
    }

    if (queryError || !info) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <h2 className="text-xl font-bold text-destructive mb-2">Invitation Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        This invitation link is invalid or has expired.
                    </p>
                    <Link href="/">
                        <Button>Go to Homepage</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
                <Card className="max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
                    <p className="text-muted-foreground mb-8">
                        Your contact information has been securely received by <strong>{info.groupName}</strong>.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Powered by Keep Contacts
                    </p>
                    <Button variant="outline" onClick={() => {
                        setSubmitted(false);
                        setFirstName('');
                        setLastName('');
                        setPhone('');
                        setEmail('');
                        setCountryCode('+229');
                    }}>
                        Submit another response
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4 text-primary">
                        <Users className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{info.groupName}</h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{info.organizationName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                        is collecting contact information.
                    </p>
                </div>

                <Card className="p-8 shadow-lg border-primary/10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CountryCodeSelect
                                label="Country"
                                value={countryCode}
                                onChange={setCountryCode}
                            />

                            <Input
                                label="Phone Number"
                                placeholder="96811859"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <Input
                            label="Email Address (Optional)"
                            placeholder="john@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {errorMsg && (
                            <p className="text-sm text-destructive text-center">{errorMsg}</p>
                        )}

                        <Button type="submit" className="w-full h-11 text-base shadow-sm" isLoading={isSubmitting}>
                            Submit Contact
                        </Button>

                        <div className="text-center pt-4 border-t mt-4">
                            <p className="text-xs text-muted-foreground mb-3">
                                Download the current contact list for this group:
                            </p>
                            <div className="flex gap-2 justify-center">
                                <Button type="button" variant="outline" size="sm" onClick={() => window.open(`${api.defaults.baseURL}/export/invitation/${slug}/csv`, '_blank')}>
                                    Download CSV
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => window.open(`${api.defaults.baseURL}/export/invitation/${slug}/vcf`, '_blank')}>
                                    Download VCF
                                </Button>
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-xs text-muted-foreground">
                                Your data is securely stored and only accessible by the organization admins.
                            </p>
                        </div>
                    </form>
                </Card>

                <div className="text-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                        Powered by Keep Contacts
                    </Link>
                </div>
            </div>
        </div>
    );
}
