import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return { message: 'Keep Contacts API', version: '1.0.0' };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
