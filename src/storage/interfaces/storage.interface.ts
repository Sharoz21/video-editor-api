import { Readable } from 'stream';

export interface StorageRepositoryInterface {
  uploadFile(fileStream: Readable, fileName: string): Promise<any>;
  getDownloadableLink(fileName: string): Promise<string>;
  getFileStream(fileName: string): Promise<Readable>;
}
