'use client';

import { useState, useRef, useEffect } from 'react';
import { COUNTRIES, type Country } from '@/lib/countries';

// Simple function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

interface PhoneInputProps {
    countryCode: string;           // ISO country code (BJ, FR, US)
    phoneNumber: string;           // Phone number without country code
    onCountryChange: (code: string) => void;
    onPhoneChange: (phone: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
}

export function PhoneInput({
    countryCode,
    phoneNumber,
    onCountryChange,
    onPhoneChange,
    label,
    placeholder = '612 345 678',
    error,
}: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES.find(c => c.code === 'BJ');

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm)
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers and common phone characters
        const value = e.target.value.replace(/[^\d\s\-\+()]/g, '');
        onPhoneChange(value);
    };

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium mb-2">{label}</label>}
            
            <div className={`flex gap-2 ${error ? 'mb-2' : ''}`}>
                {/* Country Selector */}
                <div className="relative">
                    <button
                        ref={buttonRef}
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-10 min-w-28 border border-input rounded-md px-2 py-2 text-sm bg-background hover:bg-muted/50 flex items-center justify-center gap-1.5 transition-colors"
                        title={selectedCountry?.name}
                    >
                        {selectedCountry && (
                            <>
                                <span className="text-lg">{getFlagEmoji(selectedCountry.code)}</span>
                                <span className="font-medium hidden sm:inline text-xs">{selectedCountry.code}</span>
                            </>
                        )}
                        <span className="text-muted-foreground text-xs">▼</span>
                    </button>

                    {isOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-950 border border-input rounded-md shadow-lg z-50 min-w-80"
                        >
                            <div className="sticky top-0 p-2 border-b border-input bg-white dark:bg-slate-950">
                                <input
                                    type="text"
                                    placeholder="Rechercher un pays..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-8 px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => {
                                                onCountryChange(country.code);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
                                                countryCode === country.code ? 'bg-accent' : ''
                                            }`}
                                        >
                                            <span className="text-lg">{getFlagEmoji(country.code)}</span>
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{country.name}</div>
                                                <div className="text-xs text-muted-foreground">{country.code} • {country.dialCode}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-8 text-sm text-muted-foreground text-center">
                                        Aucun pays trouvé
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="flex-1 relative">
                    <div className="flex items-center h-10 border border-input rounded-md px-3 bg-background">
                        {selectedCountry && (
                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                {selectedCountry.dialCode}
                            </span>
                        )}
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder={placeholder}
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                </div>
            </div>

            {/* Benin Special Note */}
            {selectedCountry?.code === 'BJ' && phoneNumber && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800">
                    <span className="font-medium">ℹ️ Note :</span> Le numéro sera sauvegardé en deux versions pour la compatibilité WhatsApp
                </div>
            )}

            {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
                    {error}
                </div>
            )}
        </div>
    );
}
