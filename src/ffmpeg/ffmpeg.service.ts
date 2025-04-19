import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';
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

  createResizeStream(
    filePath: string,
    width: number,
    height: number,
  ): Readable {
    const process = spawn('ffmpeg', [
      '-i',
      filePath,
      '-vf',
      `scale=${width}:${height}`,
      '-c:v',
      'libx264',
      '-f',
      'matroska',
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

  createAudioStream(filePath: string): Readable {
    const process = spawn('ffmpeg', [
      '-i',
      filePath,
      '-map',
      `0:a`,
      '-f',
      'wav',
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

  createSubtitleStream(fileName: string, fileDownloadLink): Readable {
    const inputSubs = path.resolve(`${fileName}.srt`);

    if (!fs.existsSync(inputSubs)) throw new Error('Subtitle file not found');

    console.log(
      `Running: ffmpeg -i ${fileDownloadLink} -vf subtitles=${inputSubs} -f mp4 pipe:1`,
    );

    const process = spawn('ffmpeg', [
      '-i',
      fileDownloadLink,
      '-vf',
      `subtitles=${inputSubs}`,
      '-f',
      'matroska',
      'pipe:1',
    ]);

    process.stderr.on('data', (data) => {
      console.error(`FFmpeg stderr: ${data}`);
    });

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
