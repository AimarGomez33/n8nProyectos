import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MediaDto {
  @IsString()
  @IsNotEmpty()
  mimetype!: string; // p.ej: image/jpeg, image/png, audio/ogg, audio/mpeg, audio/mp4

  @IsString()
  @IsNotEmpty()
  base64!: string;   // SIN el prefijo "data:...;base64,"

  @IsString()
  @IsOptional()
  filename?: string; // recomendado para imagen/audio

  @IsString()
  @IsOptional()
  caption?: string;  // (WhatsApp no muestra caption en audio)
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  to!: string; // 52155... (se normaliza a @c.us)

  @IsString()
  @IsIn(['text', 'image', 'audio'])
  type!: 'text' | 'image' | 'audio';

  @IsString()
  @IsOptional()
  text?: string;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  media?: MediaDto;
}
