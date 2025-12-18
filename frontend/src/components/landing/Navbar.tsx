'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Menu, X, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                'fixed top-0 z-50 w-full transition-all duration-300',
                scrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent'
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Keep Contacts</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex md:items-center md:gap-6">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                        How it works
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                        Pricing
                    </Link>

                    <div className="flex items-center gap-3 ml-4">
                        {isAuthenticated ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </Link>
                                <Button onClick={logout} variant="outline">Logout</Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Log in</Button>
                                </Link>
                                <Link href="/register">
                                    <Button>Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-b bg-background px-4 py-4 shadow-lg animate-in slide-in-from-top-5">
                    <div className="flex flex-col space-y-4">
                        <Link
                            href="#features"
                            className="text-sm font-medium text-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="text-sm font-medium text-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            How it works
                        </Link>
                        <Link
                            href="#pricing"
                            className="text-sm font-medium text-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            Pricing
                        </Link>
                        <hr className="border-border" />

                        {isAuthenticated ? (
                            <div className="flex flex-col gap-2">
                                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full" variant="outline">Dashboard</Button>
                                </Link>
                                <Button onClick={() => { logout(); setIsOpen(false); }} variant="ghost" className="w-full">Logout</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full">Log in</Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
