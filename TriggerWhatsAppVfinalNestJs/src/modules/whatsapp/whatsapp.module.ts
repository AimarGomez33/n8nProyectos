import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service.js';
import { WhatsAppCloudService } from './whatsapp-cloud.service.js';
import { HealthController } from '../../presentation/qr.controller.js';
import { MessagesController } from './messages.controller.js';
import { FakeMessageService } from './fake-message.service.js';
import { SimulateMessageController } from './simulate-message.controller.js';

@Module({
  providers: [WhatsAppService, WhatsAppCloudService, HealthController, FakeMessageService],
  controllers: [MessagesController, SimulateMessageController],
  exports: [WhatsAppService, WhatsAppCloudService],
})
export class WhatsAppModule {
  static getProvider() {
    return process.env.WHATSAPP_CLOUD === 'true' ? WhatsAppCloudService : WhatsAppService;
  }
}
