import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { StorageModule } from 'src/storage/storage.module';
import { FfmpegModule } from 'src/ffmpeg/ffmpeg.module';

@Module({
  providers: [VideoService],
  controllers: [VideoController],
  imports: [StorageModule, FfmpegModule],
})
export class VideoModule {}
