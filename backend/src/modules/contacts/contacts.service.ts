import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupsService } from '../groups/groups.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { normalizePhone, generateAlternatePhone } from '../../common/utils/phone.util';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private groupsService: GroupsService,
  ) { }

  async createPublic(dto: CreateContactDto) {
    const group = await this.groupsService.getGroupByInviteSlug(dto.slug);

    const phone = normalizePhone(dto.phone);
    const alternatePhone = generateAlternatePhone(dto.phone, dto.countryCode);
    const tag = group.organization.autoTag || dto.tag;

    await this.prisma.contact.create({
      data: {
        groupId: group.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone,
        alternatePhone,
        email: dto.email,
        tag,
      },
    });

    return { status: 'ok' };
  }

  async getInvitationInfo(slug: string) {
    const group = await this.groupsService.getGroupByInviteSlug(slug);

    return {
      groupName: group.name,
      organizationName: group.organization.name,
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
      data.phone = normalizePhone(dto.phone);
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
