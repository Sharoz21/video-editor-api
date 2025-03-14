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

  async upload(req: Request, fileName: string, extension: string) {
    return await this.storageService.uploadFile(
      req,
      `${fileName}.${extension}`,
    );
  }

  async getThumbnailStream(fileName: string) {
    const filePath = await this.storageService.getDownloadableLink(fileName);
    return this.ffmpegService.createThumbnailStream(filePath);
  }

  async resize(fileName: string, width: number, height: number) {
    const filePath = await this.storageService.getDownloadableLink(fileName);

    const resizeStreamReadable = await this.ffmpegService.createResizeStream(
      filePath,
      width,
      height,
    );

    return await this.storageService.uploadFile(
      resizeStreamReadable,
      `${fileName.split('.')[0]}-${width}x${height}.mp4`,
    );
  }
}
