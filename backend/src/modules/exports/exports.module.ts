import { Module } from '@nestjs/common';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { GroupsModule } from '../groups/groups.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, GroupsModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
