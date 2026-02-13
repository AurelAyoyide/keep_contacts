'use client';

import { useState } from 'react';
import { Contact } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Edit2, Trash2, Phone, Mail, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ContactsTableProps {
    contacts: Contact[];
    onEdit: (contact: Contact) => void;
    onDelete: (contact: Contact) => void;
}

export function ContactsTable({ contacts, onEdit, onDelete }: ContactsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContacts = contacts.filter((contact) =>
        contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (contacts.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No contacts yet</h3>
                <p className="mt-2 text-muted-foreground max-w-sm">
                    Wait for submissions via the invitation link or add them manually (if supported).
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="max-w-sm"
                />
                <div className="text-sm text-muted-foreground ml-auto">
                    {filteredContacts.length} contacts
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Tag</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredContacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        {(contact.firstName || '') && (contact.lastName || '') 
                                            ? `${contact.firstName} ${contact.lastName}` 
                                            : contact.firstName || contact.lastName || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {contact.phone ? (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                {contact.phone}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {contact.email ? (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                {contact.email}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {contact.tag ? (
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                                                {contact.tag}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(contact)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => onDelete(contact)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
