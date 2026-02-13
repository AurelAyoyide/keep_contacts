import { Controller, Get, Post, Param, Query, Res, UseGuards, Body, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { CreateExportTokenDto } from './dto/create-export-token.dto';

@Controller()
export class ExportsController {
  constructor(private exportsService: ExportsService) { }

  @UseGuards(JwtAuthGuard)
  @Post('groups/:groupId/export/token')
  createExportToken(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
    @Body() dto: CreateExportTokenDto,
  ) {
    return this.exportsService.createExportToken(user.userId, groupId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('groups/:groupId/export/tokens')
  listExportTokens(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
  ) {
    return this.exportsService.listExportTokens(user.userId, groupId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('groups/:groupId/export/tokens/:tokenId/revoke')
  revokeExportToken(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
    @Param('tokenId') tokenId: string,
  ) {
    return this.exportsService.revokeExportToken(user.userId, groupId, tokenId);
  }

  @Get('export')
  async publicExport(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      throw new ForbiddenException('Token requis');
    }

    const { filename, content, contentType } = await this.exportsService.exportWithToken(token);

    res.setHeader('Content-Type', `${contentType}; charset=utf-8`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @UseGuards(JwtAuthGuard)
  @Get('groups/:groupId/export/vcf')
  async exportVcf(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
    @Res() res: Response,
  ) {
    const { filename, content } = await this.exportsService.exportVcf(user.userId, groupId);

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Get('export/invitation/:slug/vcf')
  async exportInvitationVcf(@Param('slug') slug: string, @Res() res: Response) {
    const { filename, content } = await this.exportsService.exportByInvitationSlug(slug);

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }
}
