import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12; // recommended for GCM

@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor() {
    this.key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must decode to 32 bytes');
    }
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
  }

  decrypt(payload: string): string {
    const parts = payload.split(':');
    if (parts.length !== 3) throw new Error('invalid ciphertext format');
    const [ivHex, tagHex, dataHex] = parts as [string, string, string];
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const decipher = createDecipheriv(ALGO, this.key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString('utf8');
  }
}
