import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { Request } from 'express';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import * as fs from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import * as tmp from 'tmp';
import { extname } from 'node:path';

const streamPipeline = promisify(pipeline);

@Injectable()
export class VideoService {
  constructor(
    private storageService: StorageService,
    private ffmpegService: FfmpegService,
    private openAiService: OpenAiService,
    @InjectQueue('video') private videoQueue: Queue,
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
    const job = await this.videoQueue.add(
      'resize',
      { fileName, width, height },
      { attempts: 3 },
    );

    return {
      message:
        'Your request to resize the video has been received and added to the processing queue. You will be notified once the processing is complete.',
      job_id: job.id,
    };
  }

  async resizeStatus(jobId: string) {
    const job = (await this.videoQueue.getJob(jobId)) as Job;

    if (!job) throw new NotFoundException('No job not found.');
    return { status: await job.getState() };
  }

  async extractAudio(fileName: string) {
    const filePath = await this.storageService.getDownloadableLink(fileName);
    const audioStream = this.ffmpegService.createAudioStream(filePath);
    return await this.storageService.uploadFile(
      audioStream,
      `${fileName?.split('.')[0] ?? 'test'}.wav`,
    );
  }

  async addSubtitles(fileName: string): Promise<string> {
    const file = fileName?.split('.')[0] ?? 'test';

    const audioReadStream = await this.storageService.getFileStream(
      `${file}.wav`,
    );

    const tempFile = tmp.fileSync({
      postfix: '.wav',
    });
    const tempFilePath = tempFile.name;

    await streamPipeline(audioReadStream, createWriteStream(tempFilePath));

    const audioBuffer = await fs.readFile(tempFilePath);

    const subtitles = await this.openAiService.getAudioTranscription(
      fileName,
      createReadStream(tempFilePath),
      createReadStream(tempFilePath),
    );

    const srtFileHandler = await fs.open(`${file}.srt`, 'w');

    await srtFileHandler.writeFile(subtitles);
    await srtFileHandler.close();

    const videoDownloadableLink =
      await this.storageService.getDownloadableLink(fileName);

    const readStream = this.ffmpegService.createSubtitleStream(
      file,
      videoDownloadableLink,
    );

    const writeStream = createWriteStream('withSubtitles.mp4');

    return new Promise((resolve) => {
      readStream.pipe(writeStream);

      writeStream.on('finish', () => {
        resolve('File successfully written');
      });
    });
  }

  async getFileStream(fileName: string) {
    return await this.storageService.getFileStream(fileName);
  }
}
