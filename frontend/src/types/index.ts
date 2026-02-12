export interface Organization {
    id: string;
    name: string;
    slug: string;
    autoTag?: string;
    tagEnabled?: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        groups: number;
        admins: number;
    };
}

export interface Group {
    id: string;
    name: string;
    slug: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        contacts: number;
    };
}

export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    tag?: string;
    countryCode?: string;
    dateOfBirth?: string | Date;
    groupId: string;
    createdAt: string;
}

export interface Invitation {
    id: string;
    slug: string;
    groupId: string;
    expiresAt?: string;
    allowDownload?: boolean;
    createdAt: string;
}

export interface ExportToken {
    id: string;
    token: string;
    groupId: string;
    format: 'vcf';
    expiresAt: string;
    usedAt?: string;
    createdAt: string;
    url?: string; // Frontend helper
}

export interface User {
    id: string;
    email: string;
}
