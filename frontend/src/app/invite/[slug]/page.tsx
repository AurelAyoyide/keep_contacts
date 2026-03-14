'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { CheckCircle, Users, Building2, UserPlus, Download } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { InvitationInfo } from '@/types';

/** 
 * On mobile, serve the VCF without Content-Disposition: attachment so 
 * the OS intercepts it and opens the native Contacts app directly (1-click save).
 * On desktop, trigger a normal file download.
 */
function openVcf(url: string) {
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );

    if (isMobile) {
        // Inline mode: browser/OS handles the vCard natively
        window.location.href = url + (url.includes('?') ? '&' : '?') + 'inline=true';
    } else {
        // Desktop: trigger a proper file download
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

export default function InvitationPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [downloadableContacts, setDownloadableContacts] = useState<any[]>([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [nickname, setNickname] = useState('');
    const [tag, setTag] = useState('');
    const [organization, setOrganization] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [countryCode, setCountryCode] = useState('BJ'); // Default to Benin

    const { data: info, isLoading, error: queryError } = useQuery({
        queryKey: ['invitation', slug],
        queryFn: async () => {
            const { data } = await api.get<InvitationInfo>(`/invitation/${slug}`);
            return data;
        },
        retry: false,
    });

    // Helper to check if a field is required
    const isFieldRequired = (field: string) => {
        return info?.requiredFields?.includes(field) ?? false;
    };

    // Helper to check if a field should be displayed
    const shouldDisplayField = (field: string) => {
        return info?.requiredFields?.includes(field) ?? false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const payload: any = {
                slug,
                countryCode,
            };

            // Only include fields if they're required or have values
            if (isFieldRequired('firstName') || firstName) {
                payload.firstName = firstName;
            }
            if (isFieldRequired('lastName') || lastName) {
                payload.lastName = lastName;
            }
            if (isFieldRequired('phone') || phone) {
                payload.phone = phone;
            }
            if (isFieldRequired('email') || email) {
                payload.email = email;
            }
            if (isFieldRequired('dateOfBirth') || dateOfBirth) {
                payload.dateOfBirth = dateOfBirth;
            }
            if (isFieldRequired('nickname') || nickname) {
                payload.nickname = nickname;
            }
            if (isFieldRequired('tag') || tag) {
                payload.tag = tag;
            }
            if (isFieldRequired('organization') || organization) {
                payload.organization = organization;
            }
            if (isFieldRequired('jobTitle') || jobTitle) {
                payload.jobTitle = jobTitle;
            }
            if (isFieldRequired('address') || address) {
                payload.address = address;
            }
            if (isFieldRequired('city') || city) {
                payload.city = city;
            }
            if (isFieldRequired('country') || country) {
                payload.country = country;
            }

            await api.post('/contacts', payload);
            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || 'Failed to submit contact');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
        setFirstName('');
        setLastName('');
        setPhone('');
        setEmail('');
        setDateOfBirth('');
        setNickname('');
        setTag('');
        setOrganization('');
        setJobTitle('');
        setAddress('');
        setCity('');
        setCountry('');
        setCountryCode('BJ');
        setDownloadableContacts([]);
    };

    const loadDownloadableContacts = async () => {
        setIsLoadingContacts(true);
        try {
            const { data } = await api.get(`/export/invitation/${slug}/contacts`);
            setDownloadableContacts(data.contacts || []);
        } catch (err: any) {
            console.error('Failed to load downloadable contacts:', err);
            setDownloadableContacts([]);
        } finally {
            setIsLoadingContacts(false);
        }
    };

    useEffect(() => {
        if (submitted && downloadableContacts.length === 0 && !isLoadingContacts) {
            loadDownloadableContacts();
        }
    }, [submitted]);

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
                <div className="w-full max-w-2xl space-y-6">
                    {/* Success Message */}
                    <Card className="p-8 text-center animate-in zoom-in-95 duration-300">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
                        <p className="text-muted-foreground mb-8">
                            Your contact information has been securely received by <strong>{info.groupName}</strong>.
                        </p>
                    </Card>

                    {/* Downloadable Contacts Section */}
                    {info.allowDownload && (
                        <Card className="p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Download Contacts</h3>

                            {isLoadingContacts ? (
                                <div className="flex items-center justify-center py-8">
                                    <Spinner size="lg" />
                                </div>
                            ) : downloadableContacts.length > 0 ? (
                                <>
                                    {/* Download All Button */}
                                    <div className="pb-4 border-b">
                                        <Button
                                            className="w-full flex items-center gap-2"
                                            onClick={() => openVcf(`${api.defaults.baseURL}/export/invitation/${slug}/vcf`)}
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            Save All Contacts
                                        </Button>
                                    </div>

                                    {/* Individual Contacts List */}
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {downloadableContacts.map((contact) => (
                                            <div
                                                key={contact.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground truncate">
                                                        {contact.name}
                                                    </p>
                                                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                                        {contact.phone && (
                                                            <span className="truncate">{contact.phone}</span>
                                                        )}
                                                        {contact.email && (
                                                            <span className="truncate">{contact.email}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-2 flex-shrink-0"
                                                    onClick={() => openVcf(`${api.defaults.baseURL}/export/invitation/${slug}/contact/${contact.id}/vcf`)}
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground py-4">
                                    No contacts available for download.
                                </p>
                            )}
                        </Card>
                    )}

                    {/* Footer */}
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Your data is securely stored and only accessible by the organization admins.
                        </p>
                        <Button variant="outline" className="w-full" onClick={handleReset}>
                            Submit another response
                        </Button>
                    </div>
                </div>
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
                        {/* First Name - Usually required */}
                        {shouldDisplayField('firstName') && (
                            <Input
                                label={`First Name ${!isFieldRequired('firstName') ? '(Optional)' : ''}`}
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required={isFieldRequired('firstName')}
                            />
                        )}

                        {/* Last Name - Usually required */}
                        {shouldDisplayField('lastName') && (
                            <Input
                                label={`Last Name ${!isFieldRequired('lastName') ? '(Optional)' : ''}`}
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required={isFieldRequired('lastName')}
                            />
                        )}

                        {/* Phone */}
                        {shouldDisplayField('phone') && (
                            <div>
                                <PhoneInput
                                    label={`Numéro de téléphone ${!isFieldRequired('phone') ? '(Optional)' : ''}`}
                                    countryCode={countryCode}
                                    phoneNumber={phone}
                                    onCountryChange={setCountryCode}
                                    onPhoneChange={setPhone}
                                    placeholder="96811859"
                                />
                            </div>
                        )}

                        {/* Email */}
                        {shouldDisplayField('email') && (
                            <Input
                                label={`Email Address ${!isFieldRequired('email') ? '(Optional)' : ''}`}
                                placeholder="john@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required={isFieldRequired('email')}
                            />
                        )}

                        {/* Date of Birth */}
                        {shouldDisplayField('dateOfBirth') && (
                            <Input
                                label={`Date of Birth ${!isFieldRequired('dateOfBirth') ? '(Optional)' : ''}`}
                                placeholder="YYYY-MM-DD"
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required={isFieldRequired('dateOfBirth')}
                            />
                        )}

                        {/* Nickname */}
                        {shouldDisplayField('nickname') && (
                            <Input
                                label={`Nickname ${!isFieldRequired('nickname') ? '(Optional)' : ''}`}
                                placeholder="e.g., JD, Johnny"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                required={isFieldRequired('nickname')}
                            />
                        )}

                        {/* Tag */}
                        {shouldDisplayField('tag') && (
                            <Input
                                label={`Tag/Category ${!isFieldRequired('tag') ? '(Optional)' : ''}`}
                                placeholder="e.g., VIP, Friend, Family"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                required={isFieldRequired('tag')}
                            />
                        )}

                        {/* Professional Section */}
                        {(shouldDisplayField('organization') || shouldDisplayField('jobTitle')) && (
                            <div className="space-y-4 pt-2 border-t">
                                <h3 className="text-sm font-semibold text-foreground">Professional Information</h3>
                                {shouldDisplayField('organization') && (
                                    <Input
                                        label={`Organization ${!isFieldRequired('organization') ? '(Optional)' : ''}`}
                                        placeholder="e.g., Acme Corp"
                                        value={organization}
                                        onChange={(e) => setOrganization(e.target.value)}
                                        required={isFieldRequired('organization')}
                                    />
                                )}
                                {shouldDisplayField('jobTitle') && (
                                    <Input
                                        label={`Job Title ${!isFieldRequired('jobTitle') ? '(Optional)' : ''}`}
                                        placeholder="e.g., Developer"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        required={isFieldRequired('jobTitle')}
                                    />
                                )}
                            </div>
                        )}

                        {/* Location Section */}
                        {(shouldDisplayField('address') || shouldDisplayField('city') || shouldDisplayField('country')) && (
                            <div className="space-y-4 pt-2 border-t">
                                <h3 className="text-sm font-semibold text-foreground">Location</h3>
                                {shouldDisplayField('address') && (
                                    <Input
                                        label={`Address ${!isFieldRequired('address') ? '(Optional)' : ''}`}
                                        placeholder="e.g., 123 Main St"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required={isFieldRequired('address')}
                                    />
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    {shouldDisplayField('city') && (
                                        <Input
                                            label={`City ${!isFieldRequired('city') ? '(Optional)' : ''}`}
                                            placeholder="e.g., New York"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required={isFieldRequired('city')}
                                        />
                                    )}
                                    {shouldDisplayField('country') && (
                                        <Input
                                            label={`Country ${!isFieldRequired('country') ? '(Optional)' : ''}`}
                                            placeholder="e.g., USA"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            required={isFieldRequired('country')}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {errorMsg && (
                            <p className="text-sm text-destructive text-center">{errorMsg}</p>
                        )}

                        <Button type="submit" className="w-full h-11 text-base shadow-sm" isLoading={isSubmitting}>
                            Submit Contact
                        </Button>

                        {info.allowDownload && (
                            <div className="text-center pt-4 border-t mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full flex items-center gap-2"
                                    onClick={() => openVcf(`${api.defaults.baseURL}/export/invitation/${slug}/vcf`)}
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Save Contacts
                                </Button>
                            </div>
                        )}

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
