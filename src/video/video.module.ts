import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { StorageModule } from 'src/storage/storage.module';
import { FfmpegModule } from 'src/ffmpeg/ffmpeg.module';
import { BullModule } from '@nestjs/bullmq';
import { VideoConsumer } from './video.consumer';

@Module({
  providers: [VideoService, VideoConsumer],
  controllers: [VideoController],
  imports: [
    BullModule.registerQueue({
      name: 'video',
    }),
    StorageModule,
    FfmpegModule,
  ],
})
export class VideoModule {}
