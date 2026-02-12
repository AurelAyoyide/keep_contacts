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
      .join('\n');
    return {
      filename: `${exportToken.group.slug}-contacts.vcf`,
      content,
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
      .join('\n');

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

    const contacts = await this.prisma.contact.findMany({
      where: { groupId: invitation.groupId },
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
      .join('\n');
    return {
      filename: `${invitation.group.slug}-contacts.vcf`,
      content,
      contentType: 'text/vcard',
    };
  }

  private getCompleteTag(tag: string | null, autoTag: string | null, tagEnabled: boolean): string {
    if (!tagEnabled || !autoTag) {
      return tag || '';
    }

    if (tag) {
      return `${tag} - ${autoTag}`;
    }

    return autoTag;
  }

  private generateVcard(
    contact: {
      firstName: string;
      lastName: string;
      phone: string;
      alternatePhone?: string | null;
      email?: string | null;
      dateOfBirth?: Date | null;
      tag?: string | null;
    },
    autoTag?: string | null,
    tagEnabled: boolean = true,
  ): string {
    const completeTag = this.getCompleteTag(contact.tag || null, autoTag || null, tagEnabled);
    const tagPart = completeTag ? ` {${completeTag}}` : '';

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${contact.lastName};${contact.firstName};;;`,
      `FN:${contact.firstName} ${contact.lastName}${tagPart}`,
      `TEL;TYPE=CELL:${contact.phone}`,
    ];

    // Add alternate phone if it exists
    if (contact.alternatePhone) {
      lines.push(`TEL;TYPE=CELL:${contact.alternatePhone}`);
    }

    if (contact.email) {
      lines.push(`EMAIL:${contact.email}`);
    }

    // Add date of birth if it exists
    if (contact.dateOfBirth) {
      const bday = new Date(contact.dateOfBirth);
      const year = bday.getFullYear();
      const month = String(bday.getMonth() + 1).padStart(2, '0');
      const day = String(bday.getDate()).padStart(2, '0');
      lines.push(`BDAY:${year}-${month}-${day}`);
    }

    lines.push('END:VCARD');

    return lines.join('\n');
  }
}
