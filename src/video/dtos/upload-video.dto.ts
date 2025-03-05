import { IsNotEmpty } from 'class-validator';

export class UploadVideoDto {
  @IsNotEmpty()
  fileName: string;
}
