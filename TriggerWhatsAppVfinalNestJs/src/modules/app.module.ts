import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from '../presentation/qr.controller';
import { WhatsAppModule } from './whatsapp/whatsapp.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WhatsAppModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
