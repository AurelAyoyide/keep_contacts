import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { GroupsModule } from './modules/groups/groups.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ExportsModule } from './modules/exports/exports.module';
import { AppController } from './app.controller';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    GroupsModule,
    ContactsModule,
    ExportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
