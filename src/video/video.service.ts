import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { Request } from 'express';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';

@Injectable()
export class VideoService {
  constructor(
    private storageService: StorageService,
    private ffmpegService: FfmpegService,
  ) {}

  async uploadVideo(req: Request, fileName: string, extension: string) {
    return await this.storageService.uploadFile(
      req,
      `${fileName}.${extension}`,
    );
  }

  async getThumbnailStream(fileName: string) {
    const filePath = await this.storageService.getDownloadableLink(fileName);
    return this.ffmpegService.createThumbnailStream(filePath);
  }
}
