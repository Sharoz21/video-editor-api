import { Readable } from 'stream';

export interface StorageRepositoryInterface {
  uploadFile(fileStream: Readable, fileName: string): Promise<any>;
}
