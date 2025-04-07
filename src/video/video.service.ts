import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { Request } from 'express';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

@Injectable()
export class VideoService {
  constructor(
    private storageService: StorageService,
    private ffmpegService: FfmpegService,
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
}
