import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { DropboxRepository } from './repositories/dropbox.repository';

@Module({
  providers: [
    StorageService,
    {
      useClass: DropboxRepository,
      provide: 'StorageRepository',
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
