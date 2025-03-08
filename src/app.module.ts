import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';
import { FfmpegModule } from './ffmpeg/ffmpeg.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), VideoModule, StorageModule, FfmpegModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
