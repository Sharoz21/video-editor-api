import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';

@Injectable()
export class FfmpegService {
  createThumbnailStream(filePath: string): Readable {
    const process = spawn('ffmpeg', [
      '-i',
      filePath,
      '-vf',
      "select='eq(n\\,4)'",
      '-vsync',
      'vfr',
      '-frames:v',
      '1',
      '-f',
      'image2pipe',
      '-vcodec',
      'png',
      'pipe:1',
    ]);

    process.on('error', (err) => {
      process.stdout.emit('error', err);
    });

    process.on('exit', (code) => {
      if (code !== 0) {
        const error = new Error(`FFmpeg exited with code ${code}`);
        process.stdout.emit('error', error);
      }
    });

    process.stdout.on('end', () => {
      if (!process.killed) {
        process.kill();
      }
    });

    return process.stdout;
  }
}
