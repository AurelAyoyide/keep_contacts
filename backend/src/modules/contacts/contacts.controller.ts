import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@Controller()
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post('contacts')
  createPublic(@Body() dto: CreateContactDto) {
    return this.contactsService.createPublic(dto);
  }

  @Get('invitation/:slug')
  getInvitationInfo(@Param('slug') slug: string) {
    return this.contactsService.getInvitationInfo(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('groups/:groupId/contacts')
  findByGroup(@CurrentUser() user: CurrentUserData, @Param('groupId') groupId: string) {
    return this.contactsService.findByGroup(user.userId, groupId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('contacts/:id')
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.contactsService.findOne(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('contacts/:id')
  update(@CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.update(user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('contacts/:id')
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.contactsService.remove(user.userId, id);
  }
}
