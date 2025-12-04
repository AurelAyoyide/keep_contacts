import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
