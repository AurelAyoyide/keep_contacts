import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupsService } from '../groups/groups.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { parseAndValidatePhone } from '../../common/utils/phone.util';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private groupsService: GroupsService,
  ) { }

  async createPublic(dto: CreateContactDto) {
    const group = await this.groupsService.getGroupByInviteSlug(dto.slug);

    // Parse and validate phone number
    const countryCode = dto.countryCode || 'BJ'; // Default to Benin
    const phoneResult = parseAndValidatePhone(dto.phone, countryCode);

    if (!phoneResult.isValid) {
      throw new BadRequestException(phoneResult.error || 'Invalid phone number');
    }

    const tag = group.organization.autoTag || dto.tag;

    await this.prisma.contact.create({
      data: {
        groupId: group.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: phoneResult.phone,
        alternatePhone: phoneResult.alternatePhone,
        email: dto.email,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        tag,
      },
    });

    return { status: 'ok' };
  }

  async getInvitationInfo(slug: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
      include: { group: { include: { organization: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const group = invitation.group;

    return {
      groupName: group.name,
      organizationName: group.organization.name,
      allowDownload: invitation.allowDownload,
    };
  }

  async findByGroup(userId: string, groupId: string) {
    await this.groupsService.getGroupWithAccessCheck(userId, groupId);

    return this.prisma.contact.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.getContactWithAccessCheck(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateContactDto) {
    await this.getContactWithAccessCheck(userId, id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.phone) {
      const countryCode = dto.countryCode || 'BJ';
      const phoneResult = parseAndValidatePhone(dto.phone, countryCode);
      if (!phoneResult.isValid) {
        throw new BadRequestException(phoneResult.error || 'Invalid phone number');
      }
      data.phone = phoneResult.phone;
      data.alternatePhone = phoneResult.alternatePhone;
    }

    // Convert dateOfBirth string to Date if provided
    if (dto.dateOfBirth !== undefined) {
      data.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }

    return this.prisma.contact.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.getContactWithAccessCheck(userId, id);

    await this.prisma.contact.delete({ where: { id } });

    return { message: 'Contact supprime' };
  }

  private async getContactWithAccessCheck(userId: string, contactId: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
      include: { group: { include: { organization: true } } },
    });

    if (!contact) {
      throw new NotFoundException('Contact non trouve');
    }

    const userOrg = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: contact.group.organizationId,
        },
      },
    });

    if (!userOrg) {
      throw new ForbiddenException('Acces refuse');
    }

    return contact;
  }
}
