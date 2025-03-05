import {
  Controller,
  InternalServerErrorException,
  Post,
  Req,
  Headers,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { StorageService } from 'src/storage/storage.service';
import { UploadVideoDto } from './dtos/upload-video.dto';
import * as mime from 'mime-types';

@Controller('video')
export class VideoController {
  constructor(private storageService: StorageService) {}

  @Post('/upload')
  async uploadVideo(
    @Req() req: Request,
    @Query() uploadVideoDto: UploadVideoDto,
    @Headers('content-type') contentType: string,
  ) {
    const { fileName } = uploadVideoDto;
    const ext = mime.extension(contentType);
    return await this.storageService.uploadFile(req, `${fileName}.${ext}`);
  }
}
