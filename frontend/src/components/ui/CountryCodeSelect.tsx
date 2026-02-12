'use client';

import { useState } from 'react';
import { COUNTRIES, type Country } from '@/lib/countries';

// Simple function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

interface CountryCodeSelectProps {
    value: string;      // ISO country code (BJ, FR, US)
    onChange: (value: string) => void;
    label?: string;
}

export function CountryCodeSelect({ value, onChange, label }: CountryCodeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedCountry = COUNTRIES.find(c => c.code === value) || COUNTRIES.find(c => c.code === 'BJ');

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm)
    );

    return (
        <div className="relative w-full">
            {label && <label className="block text-sm font-medium mb-2">{label}</label>}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-10 border border-input rounded-md px-3 py-2 text-sm bg-background hover:bg-muted/50 flex items-center justify-between transition-colors"
            >
                <div className="flex items-center gap-2">
                    {selectedCountry && (
                        <>
                            <span className="text-lg">{getFlagEmoji(selectedCountry.code)}</span>
                            <span className="font-medium">{selectedCountry.code}</span>
                            <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
                        </>
                    )}
                </div>
                <span className="text-muted-foreground">▼</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-950 border border-input rounded-md shadow-lg z-50 max-h-96 flex flex-col">
                        <div className="sticky top-0 p-2 border-b border-input bg-white dark:bg-slate-950">
                            <input
                                type="text"
                                placeholder="Search countries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-8 px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                    <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => {
                                            onChange(country.code);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
                                            value === country.code ? 'bg-accent' : ''
                                        }`}
                                    >
                                        <span className="text-lg">{getFlagEmoji(country.code)}</span>
                                        <span className="font-medium min-w-10">{country.code}</span>
                                        <span className="flex-1">{country.name}</span>
                                        <span className="text-muted-foreground text-xs">{country.dialCode}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-8 text-sm text-muted-foreground text-center">
                                    No countries found
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
