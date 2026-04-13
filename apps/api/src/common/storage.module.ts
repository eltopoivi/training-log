import { Global, Injectable, Module } from '@nestjs/common';
import { HeadBucketCommand, ListBucketsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

@Injectable()
export class StorageService {
  readonly client: S3Client;
  readonly bucket: string;

  constructor() {
    this.client = new S3Client({
      endpoint: env.MINIO_ENDPOINT,
      region: env.MINIO_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.MINIO_ACCESS_KEY,
        secretAccessKey: env.MINIO_SECRET_KEY,
      },
    });
    this.bucket = env.MINIO_BUCKET;
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.send(new ListBucketsCommand({}));
      return true;
    } catch {
      return false;
    }
  }

  async ensureBucket(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
  }

  async putObject(key: string, body: Uint8Array | Buffer | string, contentType?: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }
}

@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
