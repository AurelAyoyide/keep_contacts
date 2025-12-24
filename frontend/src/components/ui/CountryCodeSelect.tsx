'use client';

import { useState } from 'react';

interface Country {
    code: string;
    name: string;
    flag: string;
    dialCode: string;
}

// Liste complète de tous les pays du monde avec leurs indicatifs
const COUNTRIES: Country[] = [
    { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', dialCode: '+93' },
    { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', dialCode: '+27' },
    { code: 'AL', name: 'Albanie', flag: '🇦🇱', dialCode: '+355' },
    { code: 'DZ', name: 'Algérie', flag: '🇩🇿', dialCode: '+213' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪', dialCode: '+49' },
    { code: 'AD', name: 'Andorre', flag: '🇦🇩', dialCode: '+376' },
    { code: 'AO', name: 'Angola', flag: '🇦🇴', dialCode: '+244' },
    { code: 'SA', name: 'Arabie Saoudite', flag: '🇸🇦', dialCode: '+966' },
    { code: 'AR', name: 'Argentine', flag: '🇦🇷', dialCode: '+54' },
    { code: 'AM', name: 'Arménie', flag: '🇦🇲', dialCode: '+374' },
    { code: 'AU', name: 'Australie', flag: '🇦🇺', dialCode: '+61' },
    { code: 'AT', name: 'Autriche', flag: '🇦🇹', dialCode: '+43' },
    { code: 'AZ', name: 'Azerbaïdjan', flag: '🇦🇿', dialCode: '+994' },
    { code: 'BS', name: 'Bahamas', flag: '🇧🇸', dialCode: '+1242' },
    { code: 'BH', name: 'Bahreïn', flag: '🇧🇭', dialCode: '+973' },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880' },
    { code: 'BB', name: 'Barbade', flag: '🇧🇧', dialCode: '+1246' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪', dialCode: '+32' },
    { code: 'BZ', name: 'Belize', flag: '🇧🇿', dialCode: '+501' },
    { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dialCode: '+229' },
    { code: 'BT', name: 'Bhoutan', flag: '🇧🇹', dialCode: '+975' },
    { code: 'BY', name: 'Biélorussie', flag: '🇧🇾', dialCode: '+375' },
    { code: 'BO', name: 'Bolivie', flag: '🇧🇴', dialCode: '+591' },
    { code: 'BA', name: 'Bosnie-Herzégovine', flag: '🇧🇦', dialCode: '+387' },
    { code: 'BW', name: 'Botswana', flag: '🇧🇼', dialCode: '+267' },
    { code: 'BR', name: 'Brésil', flag: '🇧🇷', dialCode: '+55' },
    { code: 'BN', name: 'Brunei', flag: '🇧🇳', dialCode: '+673' },
    { code: 'BG', name: 'Bulgarie', flag: '🇧🇬', dialCode: '+359' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226' },
    { code: 'BI', name: 'Burundi', flag: '🇧🇮', dialCode: '+257' },
    { code: 'KH', name: 'Cambodge', flag: '🇰🇭', dialCode: '+855' },
    { code: 'CM', name: 'Cameroun', flag: '🇨🇲', dialCode: '+237' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
    { code: 'CV', name: 'Cap-Vert', flag: '🇨🇻', dialCode: '+238' },
    { code: 'CL', name: 'Chili', flag: '🇨🇱', dialCode: '+56' },
    { code: 'CN', name: 'Chine', flag: '🇨🇳', dialCode: '+86' },
    { code: 'CY', name: 'Chypre', flag: '🇨🇾', dialCode: '+357' },
    { code: 'CO', name: 'Colombie', flag: '🇨🇴', dialCode: '+57' },
    { code: 'KM', name: 'Comores', flag: '🇰🇲', dialCode: '+269' },
    { code: 'CG', name: 'Congo', flag: '🇨🇬', dialCode: '+242' },
    { code: 'CD', name: 'Congo (RDC)', flag: '🇨🇩', dialCode: '+243' },
    { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷', dialCode: '+82' },
    { code: 'KP', name: 'Corée du Nord', flag: '🇰🇵', dialCode: '+850' },
    { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', dialCode: '+506' },
    { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', dialCode: '+225' },
    { code: 'HR', name: 'Croatie', flag: '🇭🇷', dialCode: '+385' },
    { code: 'CU', name: 'Cuba', flag: '🇨🇺', dialCode: '+53' },
    { code: 'DK', name: 'Danemark', flag: '🇩🇰', dialCode: '+45' },
    { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', dialCode: '+253' },
    { code: 'DM', name: 'Dominique', flag: '🇩🇲', dialCode: '+1767' },
    { code: 'EG', name: 'Égypte', flag: '🇪🇬', dialCode: '+20' },
    { code: 'AE', name: 'Émirats Arabes Unis', flag: '🇦🇪', dialCode: '+971' },
    { code: 'EC', name: 'Équateur', flag: '🇪🇨', dialCode: '+593' },
    { code: 'ER', name: 'Érythrée', flag: '🇪🇷', dialCode: '+291' },
    { code: 'ES', name: 'Espagne', flag: '🇪🇸', dialCode: '+34' },
    { code: 'EE', name: 'Estonie', flag: '🇪🇪', dialCode: '+372' },
    { code: 'US', name: 'États-Unis', flag: '🇺🇸', dialCode: '+1' },
    { code: 'ET', name: 'Éthiopie', flag: '🇪🇹', dialCode: '+251' },
    { code: 'FJ', name: 'Fidji', flag: '🇫🇯', dialCode: '+679' },
    { code: 'FI', name: 'Finlande', flag: '🇫🇮', dialCode: '+358' },
    { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '+241' },
    { code: 'GM', name: 'Gambie', flag: '🇬🇲', dialCode: '+220' },
    { code: 'GE', name: 'Géorgie', flag: '🇬🇪', dialCode: '+995' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
    { code: 'GR', name: 'Grèce', flag: '🇬🇷', dialCode: '+30' },
    { code: 'GD', name: 'Grenade', flag: '🇬🇩', dialCode: '+1473' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹', dialCode: '+502' },
    { code: 'GN', name: 'Guinée', flag: '🇬🇳', dialCode: '+224' },
    { code: 'GQ', name: 'Guinée équatoriale', flag: '🇬🇶', dialCode: '+240' },
    { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', dialCode: '+245' },
    { code: 'GY', name: 'Guyana', flag: '🇬🇾', dialCode: '+592' },
    { code: 'HT', name: 'Haïti', flag: '🇭🇹', dialCode: '+509' },
    { code: 'HN', name: 'Honduras', flag: '🇭🇳', dialCode: '+504' },
    { code: 'HU', name: 'Hongrie', flag: '🇭🇺', dialCode: '+36' },
    { code: 'IN', name: 'Inde', flag: '🇮🇳', dialCode: '+91' },
    { code: 'ID', name: 'Indonésie', flag: '🇮🇩', dialCode: '+62' },
    { code: 'IQ', name: 'Irak', flag: '🇮🇶', dialCode: '+964' },
    { code: 'IR', name: 'Iran', flag: '🇮🇷', dialCode: '+98' },
    { code: 'IE', name: 'Irlande', flag: '🇮🇪', dialCode: '+353' },
    { code: 'IS', name: 'Islande', flag: '🇮🇸', dialCode: '+354' },
    { code: 'IL', name: 'Israël', flag: '🇮🇱', dialCode: '+972' },
    { code: 'IT', name: 'Italie', flag: '🇮🇹', dialCode: '+39' },
    { code: 'JM', name: 'Jamaïque', flag: '🇯🇲', dialCode: '+1876' },
    { code: 'JP', name: 'Japon', flag: '🇯🇵', dialCode: '+81' },
    { code: 'JO', name: 'Jordanie', flag: '🇯🇴', dialCode: '+962' },
    { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', dialCode: '+7' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
    { code: 'KG', name: 'Kirghizistan', flag: '🇰🇬', dialCode: '+996' },
    { code: 'KI', name: 'Kiribati', flag: '🇰🇮', dialCode: '+686' },
    { code: 'KW', name: 'Koweït', flag: '🇰🇼', dialCode: '+965' },
    { code: 'LA', name: 'Laos', flag: '🇱🇦', dialCode: '+856' },
    { code: 'LS', name: 'Lesotho', flag: '🇱🇸', dialCode: '+266' },
    { code: 'LV', name: 'Lettonie', flag: '🇱🇻', dialCode: '+371' },
    { code: 'LB', name: 'Liban', flag: '🇱🇧', dialCode: '+961' },
    { code: 'LR', name: 'Liberia', flag: '🇱🇷', dialCode: '+231' },
    { code: 'LY', name: 'Libye', flag: '🇱🇾', dialCode: '+218' },
    { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', dialCode: '+423' },
    { code: 'LT', name: 'Lituanie', flag: '🇱🇹', dialCode: '+370' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', dialCode: '+352' },
    { code: 'MK', name: 'Macédoine du Nord', flag: '🇲🇰', dialCode: '+389' },
    { code: 'MG', name: 'Madagascar', flag: '🇲🇬', dialCode: '+261' },
    { code: 'MY', name: 'Malaisie', flag: '🇲🇾', dialCode: '+60' },
    { code: 'MW', name: 'Malawi', flag: '🇲🇼', dialCode: '+265' },
    { code: 'MV', name: 'Maldives', flag: '🇲🇻', dialCode: '+960' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223' },
    { code: 'MT', name: 'Malte', flag: '🇲🇹', dialCode: '+356' },
    { code: 'MA', name: 'Maroc', flag: '🇲🇦', dialCode: '+212' },
    { code: 'MU', name: 'Maurice', flag: '🇲🇺', dialCode: '+230' },
    { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', dialCode: '+222' },
    { code: 'MX', name: 'Mexique', flag: '🇲🇽', dialCode: '+52' },
    { code: 'MD', name: 'Moldavie', flag: '🇲🇩', dialCode: '+373' },
    { code: 'MC', name: 'Monaco', flag: '🇲🇨', dialCode: '+377' },
    { code: 'MN', name: 'Mongolie', flag: '🇲🇳', dialCode: '+976' },
    { code: 'ME', name: 'Monténégro', flag: '🇲🇪', dialCode: '+382' },
    { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', dialCode: '+258' },
    { code: 'MM', name: 'Myanmar', flag: '🇲🇲', dialCode: '+95' },
    { code: 'NA', name: 'Namibie', flag: '🇳🇦', dialCode: '+264' },
    { code: 'NP', name: 'Népal', flag: '🇳🇵', dialCode: '+977' },
    { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', dialCode: '+505' },
    { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '+227' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
    { code: 'NO', name: 'Norvège', flag: '🇳🇴', dialCode: '+47' },
    { code: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳🇿', dialCode: '+64' },
    { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '+968' },
    { code: 'UG', name: 'Ouganda', flag: '🇺🇬', dialCode: '+256' },
    { code: 'UZ', name: 'Ouzbékistan', flag: '🇺🇿', dialCode: '+998' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92' },
    { code: 'PA', name: 'Panama', flag: '🇵🇦', dialCode: '+507' },
    { code: 'PG', name: 'Papouasie-Nouvelle-Guinée', flag: '🇵🇬', dialCode: '+675' },
    { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dialCode: '+595' },
    { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱', dialCode: '+31' },
    { code: 'PE', name: 'Pérou', flag: '🇵🇪', dialCode: '+51' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
    { code: 'PL', name: 'Pologne', flag: '🇵🇱', dialCode: '+48' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
    { code: 'DO', name: 'République Dominicaine', flag: '🇩🇴', dialCode: '+1809' },
    { code: 'CZ', name: 'République Tchèque', flag: '🇨🇿', dialCode: '+420' },
    { code: 'RO', name: 'Roumanie', flag: '🇷🇴', dialCode: '+40' },
    { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', dialCode: '+44' },
    { code: 'RU', name: 'Russie', flag: '🇷🇺', dialCode: '+7' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼', dialCode: '+250' },
    { code: 'SV', name: 'Salvador', flag: '🇸🇻', dialCode: '+503' },
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '+221' },
    { code: 'RS', name: 'Serbie', flag: '🇷🇸', dialCode: '+381' },
    { code: 'SC', name: 'Seychelles', flag: '🇸🇨', dialCode: '+248' },
    { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232' },
    { code: 'SG', name: 'Singapour', flag: '🇸🇬', dialCode: '+65' },
    { code: 'SK', name: 'Slovaquie', flag: '🇸🇰', dialCode: '+421' },
    { code: 'SI', name: 'Slovénie', flag: '🇸🇮', dialCode: '+386' },
    { code: 'SO', name: 'Somalie', flag: '🇸🇴', dialCode: '+252' },
    { code: 'SD', name: 'Soudan', flag: '🇸🇩', dialCode: '+249' },
    { code: 'SS', name: 'Soudan du Sud', flag: '🇸🇸', dialCode: '+211' },
    { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94' },
    { code: 'SE', name: 'Suède', flag: '🇸🇪', dialCode: '+46' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭', dialCode: '+41' },
    { code: 'SR', name: 'Suriname', flag: '🇸🇷', dialCode: '+597' },
    { code: 'SY', name: 'Syrie', flag: '🇸🇾', dialCode: '+963' },
    { code: 'TJ', name: 'Tadjikistan', flag: '🇹🇯', dialCode: '+992' },
    { code: 'TZ', name: 'Tanzanie', flag: '🇹🇿', dialCode: '+255' },
    { code: 'TD', name: 'Tchad', flag: '🇹🇩', dialCode: '+235' },
    { code: 'TH', name: 'Thaïlande', flag: '🇹🇭', dialCode: '+66' },
    { code: 'TL', name: 'Timor oriental', flag: '🇹🇱', dialCode: '+670' },
    { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228' },
    { code: 'TO', name: 'Tonga', flag: '🇹🇴', dialCode: '+676' },
    { code: 'TT', name: 'Trinité-et-Tobago', flag: '🇹🇹', dialCode: '+1868' },
    { code: 'TN', name: 'Tunisie', flag: '🇹🇳', dialCode: '+216' },
    { code: 'TM', name: 'Turkménistan', flag: '🇹🇲', dialCode: '+993' },
    { code: 'TR', name: 'Turquie', flag: '🇹🇷', dialCode: '+90' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦', dialCode: '+380' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dialCode: '+598' },
    { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', dialCode: '+678' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '+58' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
    { code: 'YE', name: 'Yémen', flag: '🇾🇪', dialCode: '+967' },
    { code: 'ZM', name: 'Zambie', flag: '🇿🇲', dialCode: '+260' },
    { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263' },
];

interface CountryCodeSelectProps {
    value: string;
    onChange: (dialCode: string) => void;
    label?: string;
}

export function CountryCodeSelect({ value, onChange, label }: CountryCodeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedCountry = COUNTRIES.find(c => c.dialCode === value) || COUNTRIES[19]; // Bénin par défaut

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm)
    );

    const handleSelect = (country: Country) => {
        onChange(country.dialCode);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                </label>
            )}

            {/* Bouton principal - même taille que Input */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-full flex items-center justify-between px-3 py-2 border border-input bg-background rounded-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-sm">{selectedCountry.dialCode}</span>
                </div>
                <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown - design amélioré */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-xl max-h-80 overflow-hidden">
                        {/* Barre de recherche */}
                        <div className="sticky top-0 p-3 bg-background border-b border-border">
                            <input
                                type="text"
                                placeholder="Rechercher un pays ou indicatif..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>

                        {/* Liste des pays - design propre */}
                        <div className="overflow-y-auto max-h-64 bg-background">
                            {filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleSelect(country)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${country.dialCode === value
                                            ? 'bg-accent/80 hover:bg-accent'
                                            : 'hover:bg-accent/50'
                                        }`}
                                >
                                    <span className="text-xl flex-shrink-0">{country.flag}</span>
                                    <span className="text-sm flex-1">{country.name}</span>
                                    <span className="text-sm text-muted-foreground font-medium">{country.dialCode}</span>
                                </button>
                            ))}
                            {filteredCountries.length === 0 && (
                                <div className="px-4 py-8 text-sm text-muted-foreground text-center bg-background">
                                    Aucun pays trouvé pour "{searchTerm}"
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
