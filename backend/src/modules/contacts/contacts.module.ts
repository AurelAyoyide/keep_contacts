import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { GroupsModule } from '../groups/groups.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, GroupsModule, OrganizationsModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
