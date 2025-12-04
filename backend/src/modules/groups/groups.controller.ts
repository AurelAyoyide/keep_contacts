import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
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
  createInvitation(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.groupsService.createInvitation(user.userId, id);
  }
}
