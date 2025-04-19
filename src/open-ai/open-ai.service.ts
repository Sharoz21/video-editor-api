import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as FormData from 'form-data';
import axios from 'axios';
import { alignmentToSrt } from 'src/utills/word-alignement';

@Injectable()
export class OpenAiService {
  private client: OpenAI;

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async getAudioTranscription(
    fileName: string,
    fileStream,
    blob,
  ): Promise<string> {
    const transcriptionStream = await this.client.audio.transcriptions.create({
      model: 'gpt-4o-transcribe',
      response_format: 'text',
      stream: true,
      file: blob,
    });

    try {
      for await (let stream of transcriptionStream) {
        if (stream.type === 'transcript.text.done') {
          const form = new FormData();

          form.append('audio', fileStream, {
            contentType: 'audio/mpeg',
            filename: 'test.wav',
          });

          form.append('transcript', stream.text, {
            contentType: 'text/plain',
          });

          const response = await axios.post(
            this.configService.getOrThrow('GENTLE_API_URL'),
            form,
            {
              headers: form.getHeaders(),
              maxBodyLength: Infinity,
              maxContentLength: Infinity,
            },
          );

          return alignmentToSrt(response.data);
        }
      }

      throw new InternalServerErrorException();
    } catch (error) {
      console.error('Gentle error:', error.response?.data || error.message);
      throw error;
    }
  }
}
