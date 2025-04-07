import {
  Controller,
  Post,
  Req,
  Headers,
  Query,
  Get,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UploadVideoDto } from './dtos/upload-video.dto';
import * as mime from 'mime-types';
import { VideoThumbnailDto } from './dtos/get-video-thumbnail.dto';
import { VideoService } from './video.service';
import { pipeline } from 'node:stream/promises';
import { ResizeVideoDto } from './dtos/resize-video.dto';
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post('/upload')
  async upload(
    @Req() req: Request,
    @Query() uploadVideoDto: UploadVideoDto,
    @Headers('content-type') contentType: string,
  ) {
    const { fileName } = uploadVideoDto;
    const ext = mime.extension(contentType);
    return await this.videoService.upload(req, fileName, ext);
  }

  @Get('/thumbnail')
  async getThumbnail(
    @Query() videoThumbnailDto: VideoThumbnailDto,
    @Res() response: Response,
  ) {
    const { fileName } = videoThumbnailDto;

    response.setHeader('Content-Type', mime.lookup('.png'));
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=thumbnail.png`,
    );

    try {
      const thumbnailStream =
        await this.videoService.getThumbnailStream(fileName);

      const cleanup = () => {
        thumbnailStream.destroy();
      };

      response.on('close', cleanup);
      response.on('finish', cleanup);

      await pipeline(thumbnailStream, response);
    } catch (error) {
      response.end();
    }
  }

  @Post('/resize')
  async resize(@Query() resizeVideoDto: ResizeVideoDto) {
    const { fileName, width, height } = resizeVideoDto;
    return await this.videoService.resize(fileName, width, height);
  }

  @Get('/resize/status')
  async resizeStatus(@Query('jobId') jobId: string) {
    return await this.videoService.resizeStatus(jobId);
  }

  @Post('/extract-audio')
  async extractAudio(@Query() extractVideoAudioDto: VideoThumbnailDto) {
    const { fileName } = extractVideoAudioDto;
    return await this.videoService.extractAudio(fileName);
  }
}
