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
  ) {}

  async createExportToken(userId: string, groupId: string, dto: CreateExportTokenDto) {
    await this.groupsService.getGroupWithAccessCheck(userId, groupId);

    const token = generateSecureToken();
    const expiresAt = getExpirationDate(dto.expiresInHours || 24);

    const exportToken = await this.prisma.exportToken.create({
      data: {
        token,
        groupId,
        format: dto.format || 'csv',
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
      include: { group: true },
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

    if (exportToken.format === 'vcf') {
      const content = contacts.map((c) => this.generateVcard(c)).join('\n');
      return {
        filename: `${exportToken.group.slug}-contacts.vcf`,
        content,
        contentType: 'text/vcard',
      };
    }

    const content = this.generateCsvContent(contacts);
    return {
      filename: `${exportToken.group.slug}-contacts.csv`,
      content,
      contentType: 'text/csv',
    };
  }

  async exportCsv(userId: string, groupId: string) {
    const group = await this.groupsService.getGroupWithAccessCheck(userId, groupId);

    const contacts = await this.prisma.contact.findMany({
      where: { groupId },
      orderBy: { lastName: 'asc' },
    });

    const content = this.generateCsvContent(contacts);

    return { filename: `${group.slug}-contacts.csv`, content };
  }

  async exportVcf(userId: string, groupId: string) {
    const group = await this.groupsService.getGroupWithAccessCheck(userId, groupId);

    const contacts = await this.prisma.contact.findMany({
      where: { groupId },
      orderBy: { lastName: 'asc' },
    });

    const content = contacts.map((c) => this.generateVcard(c)).join('\n');

    return { filename: `${group.slug}-contacts.vcf`, content };
  }

  private generateCsvContent(contacts: Array<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    tag: string | null;
  }>): string {
    const headers = ['Prenom', 'Nom', 'Telephone', 'Email', 'Tag'];
    const rows = contacts.map((c) => [
      this.escapeCsvField(c.firstName),
      this.escapeCsvField(c.lastName),
      this.escapeCsvField(c.phone),
      this.escapeCsvField(c.email || ''),
      this.escapeCsvField(c.tag || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private generateVcard(contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | null;
    tag?: string | null;
  }): string {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${contact.lastName};${contact.firstName};;;`,
      `FN:${contact.firstName} ${contact.lastName}`,
      `TEL;TYPE=CELL:${contact.phone}`,
    ];

    if (contact.email) {
      lines.push(`EMAIL:${contact.email}`);
    }

    if (contact.tag) {
      lines.push(`CATEGORIES:${contact.tag}`);
    }

    lines.push('END:VCARD');

    return lines.join('\n');
  }
}
