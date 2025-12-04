import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    const slug = generateSlug(dto.name);

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        autoTag: dto.autoTag,
        admins: {
          create: { userId, role: 'owner' },
        },
      },
    });

    return { id: organization.id, name: organization.name, slug: organization.slug };
  }

  async findAll(userId: string) {
    const userOrgs = await this.prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: {
          include: { _count: { select: { groups: true } } },
        },
      },
    });

    return userOrgs.map((uo) => ({
      id: uo.organization.id,
      name: uo.organization.name,
      slug: uo.organization.slug,
      autoTag: uo.organization.autoTag,
      role: uo.role,
      groupsCount: uo.organization._count.groups,
    }));
  }

  async findOne(userId: string, id: string) {
    await this.verifyAccess(userId, id);

    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        groups: { select: { id: true, name: true, slug: true } },
        _count: { select: { groups: true } },
      },
    });

    return organization;
  }

  async update(userId: string, id: string, dto: UpdateOrganizationDto) {
    await this.verifyAccess(userId, id);

    const data: any = {};
    if (dto.name) {
      data.name = dto.name;
      data.slug = generateSlug(dto.name);
    }
    if (dto.autoTag !== undefined) {
      data.autoTag = dto.autoTag;
    }

    return this.prisma.organization.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.verifyAccess(userId, id);

    await this.prisma.organization.delete({ where: { id } });

    return { message: 'Organisation supprimee' };
  }

  async verifyAccess(userId: string, organizationId: string) {
    const userOrg = await this.prisma.userOrganization.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });

    if (!userOrg) {
      throw new ForbiddenException('Acces refuse');
    }

    return userOrg;
  }

  async getOrganizationByGroupId(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { organization: true },
    });

    if (!group) {
      throw new NotFoundException('Groupe non trouve');
    }

    return group.organization;
  }
}
