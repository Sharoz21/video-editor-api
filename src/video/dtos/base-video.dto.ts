import { IsNotEmpty } from 'class-validator';

export class BaseVideoDto {
  @IsNotEmpty()
  fileName: string;
}
