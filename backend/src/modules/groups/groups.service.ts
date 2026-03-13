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

    const slug =  generateInviteSlug();
    const data: any = { groupId, slug };

    if (dto?.allowDownload !== undefined) {
      data.allowDownload = dto.allowDownload;
    }

    if (dto?.expiresInHours) {
      data.expiresAt = getExpirationDate(dto.expiresInHours);
    }

    // Store required fields as comma-separated string
    if (dto?.requiredFields && Array.isArray(dto.requiredFields)) {
      data.requiredFields = dto.requiredFields.join(',');
    } else {
      // Default required fields
      data.requiredFields = 'firstName,lastName,phone';
    }

    // Create invitation with allowed contacts if specified
    const invitation = await this.prisma.invitation.create({
      data,
    });

    // Associate allowed contacts if provided
    if (dto?.allowedContactIds && Array.isArray(dto.allowedContactIds) && dto.allowedContactIds.length > 0) {
      // Verify all contacts belong to this group
      const existingContacts = await this.prisma.contact.findMany({
        where: {
          id: { in: dto.allowedContactIds },
          groupId,
        },
        select: { id: true },
      });

      if (existingContacts.length !== dto.allowedContactIds.length) {
        throw new ForbiddenException('Some contacts do not belong to this group');
      }

      // Create associations
      await this.prisma.invitationContact.createMany({
        data: dto.allowedContactIds.map(contactId => ({
          invitationId: invitation.id,
          contactId,
        })),
      });
    }

    return {
      id: invitation.id,
      slug: invitation.slug,
      allowDownload: invitation.allowDownload,
      expiresAt: invitation.expiresAt,
      requiredFields: invitation.requiredFields.split(',').map(f => f.trim()),
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
        requiredFields: true,
        createdAt: true,
      },
    });

    return invitations.map((inv) => ({
      ...inv,
      requiredFields: inv.requiredFields
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0),
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

    if (dto.requiredFields && Array.isArray(dto.requiredFields)) {
      data.requiredFields = dto.requiredFields.join(',');
    }

    const updated = await this.prisma.invitation.update({
      where: { id: invitationId },
      data,
    });

    // Handle allowed contacts update
    if (dto?.allowedContactIds !== undefined) {
      // Delete existing associations
      await this.prisma.invitationContact.deleteMany({
        where: { invitationId },
      });

      // Create new associations if contacts provided
      if (Array.isArray(dto.allowedContactIds) && dto.allowedContactIds.length > 0) {
        // Verify all contacts belong to this group
        const existingContacts = await this.prisma.contact.findMany({
          where: {
            id: { in: dto.allowedContactIds },
            groupId,
          },
          select: { id: true },
        });

        if (existingContacts.length !== dto.allowedContactIds.length) {
          throw new ForbiddenException('Some contacts do not belong to this group');
        }

        // Create new associations
        await this.prisma.invitationContact.createMany({
          data: dto.allowedContactIds.map(contactId => ({
            invitationId,
            contactId,
          })),
        });
      }
    }

    return {
      ...updated,
      requiredFields: updated.requiredFields
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0),
    };
  }

  async getInvitationDetail(userId: string, groupId: string, invitationId: string) {
    await this.getGroupWithAccessCheck(userId, groupId);

    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, groupId },
      include: {
        allowedContacts: {
          select: { contactId: true },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return {
      id: invitation.id,
      slug: invitation.slug,
      allowDownload: invitation.allowDownload,
      expiresAt: invitation.expiresAt,
      requiredFields: invitation.requiredFields
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0),
      allowedContactIds: invitation.allowedContacts.map(ac => ac.contactId),
      createdAt: invitation.createdAt,
    };
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
