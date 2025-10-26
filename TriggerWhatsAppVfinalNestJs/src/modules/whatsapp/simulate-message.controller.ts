import { Controller, Post, Body } from '@nestjs/common';
import { FakeMessageService } from './fake-message.service.js';

// Controlador para simular mensajes entrantes
@Controller('simulate-message')
export class SimulateMessageController {
  constructor(private readonly fakeMessageService: FakeMessageService) {}

  // Ruta para simular mensaje de texto
  @Post('text')
  simulateText(@Body() body: { from: string; text: string }) {
    // Llama al servicio para simular el mensaje de texto
    return this.fakeMessageService.simulateTextMessage(body.from, body.text);
  }

  // Ruta para simular mensaje de audio
  @Post('audio')
  simulateAudio(@Body() body: { from: string; audioUrl: string }) {
    // Llama al servicio para simular el mensaje de audio
    return this.fakeMessageService.simulateAudioMessage(body.from, body.audioUrl);
  }

  // Ruta para simular mensaje de imagen
  @Post('image')
  simulateImage(@Body() body: { from: string; imageUrl: string }) {
    // Llama al servicio para simular el mensaje de imagen
    return this.fakeMessageService.simulateImageMessage(body.from, body.imageUrl);
  }
}
