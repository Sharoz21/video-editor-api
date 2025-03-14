import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StorageRepositoryInterface } from '../interfaces/storage.interface';
import { ConfigService } from '@nestjs/config';
import { Dropbox, DropboxResponseError } from 'dropbox';
import { Readable } from 'stream';

@Injectable()
export class DropboxRepository implements StorageRepositoryInterface {
  private dbx: Dropbox;
  private CHUNK_SIZE = 4 * 1024 * 1024;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get('DROPBOX_ACCESS_TOKEN');
    this.dbx = new Dropbox({ accessToken });
  }
  async uploadFile(fileStream: Readable, fileName: string) {
    try {
      let session_id: string | null = null;
      let offset = 0;

      let buff = Buffer.alloc(0);

      for await (let chunk of fileStream) {
        buff = Buffer.concat([buff, chunk]);
        while (buff.length >= this.CHUNK_SIZE) {
          const chunkToSend = buff.subarray(0, this.CHUNK_SIZE);
          buff = buff.subarray(this.CHUNK_SIZE);

          if (!session_id) {
            const uploadSessionStartResp =
              await this.dbx.filesUploadSessionStart({
                contents: chunkToSend,
              });
            session_id = uploadSessionStartResp?.result?.session_id;
          } else {
            await this.dbx.filesUploadSessionAppendV2({
              contents: chunkToSend,
              cursor: { offset, session_id },
            });
          }
          offset += chunkToSend.length;
        }
      }

      if (!session_id) {
        await this.dbx.filesUpload({
          path: `/uploads/${fileName}`,
          contents: buff,
        });
      } else {
        await this.dbx.filesUploadSessionFinish({
          commit: { path: `/uploads/${fileName}` },
          cursor: { session_id, offset },
          ...(buff.length > 0 ? { contents: buff } : {}),
        });
      }

      return { message: `${fileName} Uploaded Successfully` };
    } catch (err) {
      throw new InternalServerErrorException(
        err?.message || 'Failed to upload video to Dropbox',
      );
    }
  }

  async getDownloadableLink(fileName: string): Promise<string> {
    const path = `/uploads/${fileName}`;
    let url: string | undefined = undefined;

    try {
      const sharedLinkResp = await this.dbx.sharingCreateSharedLinkWithSettings(
        {
          path,
        },
      );
      url = sharedLinkResp.result.url;
    } catch (err) {
      if (err instanceof DropboxResponseError) {
        if (err.status === 409) {
          const sharedLinkResp = await this.dbx.sharingListSharedLinks({
            path,
          });
          url = sharedLinkResp.result.links[0].url;
        }
      }
    } finally {
      if (!url) throw new NotFoundException('Failed to download file');
      url = url.replace(/(\?|&)dl=0/, '$1dl=1');
      if (!url.includes('dl=1')) url = `${url}?dl=1`;
      return url;
    }
  }
}
