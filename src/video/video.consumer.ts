import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { StorageService } from 'src/storage/storage.service';

interface ResizeJobData {
  fileName: string;
  width: number;
  height: number;
}

@Processor('video')
export class VideoConsumer extends WorkerHost {
  constructor(
    private storageService: StorageService,
    private ffmpegService: FfmpegService,
  ) {
    super();
  }

  async process(job: Job, token?: string): Promise<any> {
    switch (job.name) {
      case 'resize':
        return await this.resizeAndUpload(job);
      default:
        return;
    }
  }

  async resizeAndUpload(job: Job<ResizeJobData>) {
    const { fileName, width, height } = job.data;
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
