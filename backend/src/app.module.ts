import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './modules/mail/mail.module';
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
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 30,
    }]),
    PrismaModule,
    MailModule,
    AuthModule,
    OrganizationsModule,
    GroupsModule,
    ContactsModule,
    ExportsModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
