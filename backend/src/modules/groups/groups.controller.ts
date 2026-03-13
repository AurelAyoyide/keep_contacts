import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(user.userId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.groupsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.groupsService.remove(user.userId, id);
  }

  @Post(':id/invitation')
  createInvitation(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto?: CreateInvitationDto,
  ) {
    return this.groupsService.createInvitation(user.userId, id, dto);
  }

  @Get(':id/invitations')
  listInvitations(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.groupsService.listInvitations(user.userId, id);
  }

  @Get(':groupId/invitation/:invitationId')
  getInvitationDetail(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.groupsService.getInvitationDetail(user.userId, groupId, invitationId);
  }

  @Patch(':groupId/invitation/:invitationId')
  updateInvitation(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
    @Param('invitationId') invitationId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.groupsService.updateInvitation(user.userId, groupId, invitationId, dto);
  }

  @Delete(':groupId/invitation/:invitationId')
  deleteInvitation(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.groupsService.deleteInvitation(user.userId, groupId, invitationId);
  }
}
