import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), VideoModule, StorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
