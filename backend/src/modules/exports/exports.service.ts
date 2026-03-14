import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupsService } from '../groups/groups.service';
import { CreateExportTokenDto } from './dto/create-export-token.dto';
import { generateSecureToken, getExpirationDate } from '../../common/utils/token.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExportsService {
  constructor(
    private prisma: PrismaService,
    private groupsService: GroupsService,
    private configService: ConfigService,
  ) { }

  async createExportToken(userId: string, groupId: string, dto: CreateExportTokenDto) {
    await this.groupsService.getGroupWithAccessCheck(userId, groupId);

    const token = generateSecureToken();
    const expiresAt = getExpirationDate(dto.expiresInHours || 24);

    const exportToken = await this.prisma.exportToken.create({
      data: {
        token,
        groupId,
        format: 'vcf',
        expiresAt,
      },
    });

    const baseUrl = this.configService.get<string>('baseUrl') || 'http://localhost:3000';

    return {
      id: exportToken.id,
      token: exportToken.token,
      format: exportToken.format,
      expiresAt: exportToken.expiresAt,
      url: `${baseUrl}/export?token=${token}`,
    };
  }

  async listExportTokens(userId: string, groupId: string) {
    await this.groupsService.getGroupWithAccessCheck(userId, groupId);

    const tokens = await this.prisma.exportToken.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        format: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
      },
    });

    const now = new Date();

    return tokens.map((t) => ({
      ...t,
      isExpired: t.expiresAt < now,
      isUsed: t.usedAt !== null,
    }));
  }

  async revokeExportToken(userId: string, groupId: string, tokenId: string) {
    await this.groupsService.getGroupWithAccessCheck(userId, groupId);

    const token = await this.prisma.exportToken.findFirst({
      where: { id: tokenId, groupId },
    });

    if (!token) {
      throw new NotFoundException('Token non trouve');
    }

    await this.prisma.exportToken.delete({ where: { id: tokenId } });

    return { message: 'Token revoque' };
  }

  async exportWithToken(token: string) {
    const exportToken = await this.prisma.exportToken.findUnique({
      where: { token },
      include: { group: { include: { organization: true } } },
    });

    if (!exportToken) {
      throw new ForbiddenException('Token invalide');
    }

    const now = new Date();

    if (exportToken.expiresAt < now) {
      throw new ForbiddenException('Token expire');
    }

    await this.prisma.exportToken.update({
      where: { id: exportToken.id },
      data: { usedAt: now },
    });

    const contacts = await this.prisma.contact.findMany({
      where: { groupId: exportToken.groupId },
      orderBy: { lastName: 'asc' },
    });

    // Only support VCF
    const content = contacts
      .map((c) =>
        this.generateVcard(
          c,
          exportToken.group.organization.autoTag,
          exportToken.group.organization.tagEnabled,
        ),
      )
      .join('\r\n'); // Strictly follow RFC6350/vCard for separators
    return {
      filename: `${exportToken.group.slug}-contacts.vcf`,
      content, // Trailing CRLF is already in generated lines join
      contentType: 'text/vcard',
    };
  }

  async exportVcf(userId: string, groupId: string) {
    const group = await this.groupsService.getGroupWithAccessCheck(userId, groupId);

    const contacts = await this.prisma.contact.findMany({
      where: { groupId },
      orderBy: { lastName: 'asc' },
      include: { group: { include: { organization: true } } },
    });

    const content = contacts
      .map((c) =>
        this.generateVcard(
          c,
          c.group.organization.autoTag,
          c.group.organization.tagEnabled,
        ),
      )
      .join('\r\n');

    return { filename: `${group.slug}-contacts.vcf`, content };
  }

  async exportByInvitationSlug(slug: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
      include: { group: { include: { organization: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation introuvable');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new ForbiddenException('Invitation expiree');
    }

    if (!invitation.allowDownload) {
      throw new ForbiddenException('Telechargement desactive pour cette invitation');
    }

    // Check if this invitation has specific allowed contacts
    const allowedContactIds = await this.prisma.invitationContact.findMany({
      where: { invitationId: invitation.id },
      select: { contactId: true },
    });

    // Build where clause: if specific contacts allowed, filter; otherwise fetch all
    const where: any = { groupId: invitation.groupId };
    if (allowedContactIds.length > 0) {
      where.id = { in: allowedContactIds.map(ic => ic.contactId) };
    }

    const contacts = await this.prisma.contact.findMany({
      where,
      orderBy: { lastName: 'asc' },
    });

    // Only VCF
    const content = contacts
      .map((c) =>
        this.generateVcard(
          c,
          invitation.group.organization.autoTag,
          invitation.group.organization.tagEnabled,
        ),
      )
      .join('\r\n');
    return {
      filename: `${invitation.group.slug}-contacts.vcf`,
      content,
      contentType: 'text/vcard',
    };
  }

  async getDownloadableContactsByInvitation(slug: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
      include: { group: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation introuvable');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new ForbiddenException('Invitation expiree');
    }

    if (!invitation.allowDownload) {
      throw new ForbiddenException('Telechargement desactive pour cette invitation');
    }

    // Check if this invitation has specific allowed contacts
    const allowedContactIds = await this.prisma.invitationContact.findMany({
      where: { invitationId: invitation.id },
      select: { contactId: true },
    });

    // Build where clause: if specific contacts allowed, filter; otherwise fetch all
    const where: any = { groupId: invitation.groupId };
    if (allowedContactIds.length > 0) {
      where.id = { in: allowedContactIds.map(ic => ic.contactId) };
    }

    const contacts = await this.prisma.contact.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    });

    return {
      slug,
      groupId: invitation.groupId,
      groupSlug: invitation.group.slug,
      hasRestriction: allowedContactIds.length > 0,
      contactCount: contacts.length,
      contacts: contacts.map(c => ({
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
        phone: c.phone || null,
        email: c.email || null,
      })),
    };
  }

  async exportSingleContactByInvitationSlug(slug: string, contactId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
      include: { group: { include: { organization: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation introuvable');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new ForbiddenException('Invitation expiree');
    }

    if (!invitation.allowDownload) {
      throw new ForbiddenException('Telechargement desactive pour cette invitation');
    }

    // Check if this invitation has specific allowed contacts
    const allowedContactIds = await this.prisma.invitationContact.findMany({
      where: { invitationId: invitation.id },
      select: { contactId: true },
    });

    // If there are allowed contacts, verify the requested contact is in the list
    if (allowedContactIds.length > 0) {
      const isAllowed = allowedContactIds.some(ic => ic.contactId === contactId);
      if (!isAllowed) {
        throw new ForbiddenException('Ce contact n\'est pas autorise pour cette invitation');
      }
    }

    // Fetch the single contact
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, groupId: invitation.groupId },
    });

    if (!contact) {
      throw new NotFoundException('Contact introuvable');
    }

    // Generate VCF for single contact
    const content = this.generateVcard(
      contact,
      invitation.group.organization.autoTag,
      invitation.group.organization.tagEnabled,
    );

    return {
      filename: `${contact.firstName || ''}_${contact.lastName || contact.id}.vcf`,
      content,
      contentType: 'text/vcard',
    };
  }

  private getCompleteTag(tag: string | null, autoTag: string | null, tagEnabled: boolean): string {
    // If tagging is disabled, return nothing
    if (!tagEnabled) {
      return '';
    }

    // Auto tag takes precedence over contact tag
    if (autoTag) {
      return autoTag;
    }

    // Use contact tag if available
    return tag || '';
  }

  private generateVcard(
    contact: {
      id?: string;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      alternatePhone?: string | null;
      email?: string | null;
      dateOfBirth?: Date | null;
      nickname?: string | null;
      tag?: string | null;
      organization?: string | null;
      jobTitle?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
    },
    autoTag?: string | null,
    tagEnabled: boolean = true,
  ): string {
    const fn = contact.firstName || '';
    const ln = contact.lastName || '';
    const completeTag = this.getCompleteTag(contact.tag || null, autoTag || null, tagEnabled);

    // Format: "FirstName LastName" or "FirstName LastName - Tag"
    const fullName = [fn, ln].filter(Boolean).join(' ');
    const displayName = completeTag ? `${fullName} - ${completeTag}` : fullName;
    const tagSuffix = completeTag ? ` - ${completeTag}` : '';

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'PRODID:-//KeepContacts//BulkImport 1.0//EN',
      `UID:urn:uuid:${contact.id}`,
      `N:${ln};${fn};;;${tagSuffix}`,
      `FN:${displayName}`,
      `REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    ];

    if (contact.phone) {
      lines.push(`TEL;TYPE=CELL,VOICE:${contact.phone}`);
    }

    if (contact.alternatePhone) {
      lines.push(`TEL;TYPE=HOME,VOICE:${contact.alternatePhone}`);
    }

    if (contact.email) {
      lines.push(`EMAIL;TYPE=INTERNET,HOME:${contact.email}`);
    }

    if (contact.dateOfBirth) {
      const bday = new Date(contact.dateOfBirth);
      const year = bday.getFullYear();
      const month = String(bday.getMonth() + 1).padStart(2, '0');
      const day = String(bday.getDate()).padStart(2, '0');
      lines.push(`BDAY:${year}-${month}-${day}`);
    }

    if (contact.nickname) {
      lines.push(`NICKNAME:${contact.nickname}`);
    }

    if (contact.organization) {
      lines.push(`ORG:${contact.organization}`);
    }
    if (contact.jobTitle) {
      lines.push(`TITLE:${contact.jobTitle}`);
    }

    if (contact.address || contact.city || contact.country) {
      const adr = `;;${contact.address || ''};${contact.city || ''};;${contact.country || ''}`;
      lines.push(`ADR;TYPE=HOME:${adr}`);
    }

    if (completeTag) {
      lines.push(`CATEGORIES:${completeTag}`);
      lines.push(`X-ABLabel:${completeTag}`);
    }

    lines.push('END:VCARD');

    // CRLF line endings
    return lines.join('\r\n');
  }
}
