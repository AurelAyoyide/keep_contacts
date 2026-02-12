import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { generateSlug, generateInviteSlug } from '../../common/utils/slug.util';
import { getExpirationDate } from '../../common/utils/token.util';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(userId: string, dto: CreateGroupDto) {
    await this.organizationsService.verifyAccess(userId, dto.organizationId);

    const slug = generateSlug(dto.name);

    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        slug,
        organizationId: dto.organizationId,
      },
    });

    return { id: group.id, name: group.name, slug: group.slug };
  }

  async findOne(userId: string, id: string) {
    const group = await this.getGroupWithAccessCheck(userId, id);

    const contactsCount = await this.prisma.contact.count({ where: { groupId: id } });

    return { ...group, contactsCount };
  }

  async update(userId: string, id: string, dto: UpdateGroupDto) {
    await this.getGroupWithAccessCheck(userId, id);

    const data: Record<string, unknown> = {};
    if (dto.name) {
      data.name = dto.name;
      data.slug = generateSlug(dto.name);
    }

    return this.prisma.group.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.getGroupWithAccessCheck(userId, id);

    await this.prisma.group.delete({ where: { id } });

    return { message: 'Groupe supprime' };
  }

  async createInvitation(userId: string, groupId: string, dto?: CreateInvitationDto) {
    await this.getGroupWithAccessCheck(userId, groupId);

    const slug = generateInviteSlug();
    const data: any = { groupId, slug };

    if (dto?.allowDownload !== undefined) {
      data.allowDownload = dto.allowDownload;
    }

    if (dto?.expiresInHours) {
      data.expiresAt = getExpirationDate(dto.expiresInHours);
    }

    const invitation = await this.prisma.invitation.create({
      data,
    });

    return {
      id: invitation.id,
      slug: invitation.slug,
      allowDownload: invitation.allowDownload,
      expiresAt: invitation.expiresAt,
    };
  }

  async listInvitations(userId: string, groupId: string) {
    await this.getGroupWithAccessCheck(userId, groupId);

    const invitations = await this.prisma.invitation.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        allowDownload: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return invitations.map((inv) => ({
      ...inv,
      isExpired: inv.expiresAt ? inv.expiresAt < new Date() : false,
    }));
  }

  async updateInvitation(
    userId: string,
    groupId: string,
    invitationId: string,
    dto: CreateInvitationDto,
  ) {
    await this.getGroupWithAccessCheck(userId, groupId);

    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, groupId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const data: any = {};
    if (dto.allowDownload !== undefined) {
      data.allowDownload = dto.allowDownload;
    }

    const updated = await this.prisma.invitation.update({
      where: { id: invitationId },
      data,
    });

    return updated;
  }

  async deleteInvitation(userId: string, groupId: string, invitationId: string) {
    await this.getGroupWithAccessCheck(userId, groupId);

    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, groupId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.invitation.delete({ where: { id: invitationId } });

    return { message: 'Invitation deleted' };
  }

  async getGroupWithAccessCheck(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { organization: true, invitations: true },
    });

    if (!group) {
      throw new NotFoundException('Groupe non trouve');
    }

    await this.organizationsService.verifyAccess(userId, group.organizationId);

    return group;
  }

  async getGroupByInviteSlug(slug: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
      include: { group: { include: { organization: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation non trouvee');
    }

    return invitation.group;
  }
}
