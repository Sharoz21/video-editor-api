import { IsNotEmpty } from 'class-validator';
import { BaseVideoDto } from './base-video.dto';

export class ResizeVideoDto extends BaseVideoDto {
  @IsNotEmpty()
  height: number;

  @IsNotEmpty()
  width: number;
}
