import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupsService } from '../groups/groups.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { parseAndValidatePhone, normalizePhoneForDeduplication } from '../../common/utils/phone.util';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private groupsService: GroupsService,
  ) { }

  async createPublic(dto: CreateContactDto) {
    const group = await this.groupsService.getGroupByInviteSlug(dto.slug);
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug: dto.slug },
    });

    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }

    // Parse requiredFields from string (comma-separated)
    const requiredFields = invitation.requiredFields
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    // Validate that all required fields are present
    const missingFields = this.validateRequiredFields(dto, requiredFields);
    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    // Parse phone if it's part of requiredFields
    let phoneResult = null;
    if (dto.phone) {
      const countryCode = dto.countryCode || 'BJ';
      phoneResult = parseAndValidatePhone(dto.phone, countryCode);

      if (!phoneResult.isValid) {
        throw new BadRequestException(phoneResult.error || 'Invalid phone number');
      }

      // Check for duplicate phone in the same group
      const normalizedNewPhone = normalizePhoneForDeduplication(phoneResult.phone);
      const existingContacts = await this.prisma.contact.findMany({
        where: {
          groupId: group.id,
          phone: {
            not: null,
          },
        },
        select: { phone: true },
      });

      for (const existing of existingContacts) {
        const normalizedExisting = normalizePhoneForDeduplication(existing.phone!);
        if (normalizedExisting === normalizedNewPhone) {
          throw new BadRequestException(
            'This phone number is already registered for this group'
          );
        }
      }
    }

    // Check for duplicate email if provided
    if (dto.email) {
      const existingEmail = await this.prisma.contact.findFirst({
        where: {
          groupId: group.id,
          email: dto.email,
        },
      });

      if (existingEmail) {
        throw new BadRequestException(
          'This email is already registered for this group'
        );
      }
    }

    const tag = group.organization.autoTag || dto.tag;

    await this.prisma.contact.create({
      data: {
        groupId: group.id,
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        phone: phoneResult?.phone || null,
        alternatePhone: phoneResult?.alternatePhone || null,
        countryCode: dto.countryCode || 'BJ',
        email: dto.email || null,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        tag,
        nickname: dto.nickname || null,
        organization: dto.organization || null,
        jobTitle: dto.jobTitle || null,
        address: dto.address || null,
        city: dto.city || null,
        country: dto.country || null,
      },
    });

    return { status: 'ok' };
  }

  /**
   * Validate that all required fields are present in the DTO
   */
  private validateRequiredFields(dto: CreateContactDto, requiredFields: string[]): string[] {
    const missing: string[] = [];

    for (const field of requiredFields) {
      switch (field) {
        case 'firstName':
          if (!dto.firstName || dto.firstName.trim().length === 0) {
            missing.push('firstName');
          }
          break;
        case 'lastName':
          if (!dto.lastName || dto.lastName.trim().length === 0) {
            missing.push('lastName');
          }
          break;
        case 'phone':
          if (!dto.phone || dto.phone.trim().length === 0) {
            missing.push('phone');
          }
          break;
        case 'email':
          if (!dto.email || dto.email.trim().length === 0) {
            missing.push('email');
          }
          break;
        case 'dateOfBirth':
          if (!dto.dateOfBirth || dto.dateOfBirth.trim().length === 0) {
            missing.push('dateOfBirth');
          }
          break;
        case 'nickname':
          if (!dto.nickname || dto.nickname.trim().length === 0) {
            missing.push('nickname');
          }
          break;
        case 'tag':
          if (!dto.tag || dto.tag.trim().length === 0) {
            missing.push('tag');
          }
          break;
        case 'organization':
          if (!dto.organization || dto.organization.trim().length === 0) {
            missing.push('organization');
          }
          break;
        case 'jobTitle':
          if (!dto.jobTitle || dto.jobTitle.trim().length === 0) {
            missing.push('jobTitle');
          }
          break;
        case 'address':
          if (!dto.address || dto.address.trim().length === 0) {
            missing.push('address');
          }
          break;
        case 'city':
          if (!dto.city || dto.city.trim().length === 0) {
            missing.push('city');
          }
          break;
        case 'country':
          if (!dto.country || dto.country.trim().length === 0) {
            missing.push('country');
          }
          break;
      }
    }

    return missing;
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
    const requiredFields = invitation.requiredFields
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    return {
      groupName: group.name,
      organizationName: group.organization.name,
      allowDownload: invitation.allowDownload,
      requiredFields, // Return parsed array to frontend
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
