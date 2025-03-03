import {
  Controller,
  InternalServerErrorException,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

@Controller('video')
export class VideoController {
  @Post('/extract-audio')
  async extractAudio(@Req() request: Request) {
    const writeStream = fs.createWriteStream('./test.mp4');
    try {
      await pipelineAsync(request, writeStream);
      return { message: 'File uploaded successfully' };
    } catch (err) {
      throw new InternalServerErrorException('File upload failed');
    }
  }
}
