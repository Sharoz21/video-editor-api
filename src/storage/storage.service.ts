import { Inject, Injectable } from '@nestjs/common';
import { StorageRepositoryInterface } from './interfaces/storage.interface';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  constructor(
    @Inject('StorageRepository')
    private storageRepo: StorageRepositoryInterface,
  ) {}

  async uploadFile(stream: Readable, fileName: string) {
    return await this.storageRepo.uploadFile(stream, fileName);
  }

  async getDownloadableLink(fileName: string) {
    return await this.storageRepo.getDownloadableLink(fileName);
  }

  async getFileStream(fileName: string) {
    return await this.storageRepo.getFileStream(fileName);
  }
}
