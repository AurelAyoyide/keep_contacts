import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.organizationsService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.organizationsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.organizationsService.remove(user.userId, id);
  }
}
