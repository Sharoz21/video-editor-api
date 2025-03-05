import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  providers: [VideoService],
  controllers: [VideoController],
  imports: [StorageModule],
})
export class VideoModule {}
