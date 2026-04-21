import * as CryptoJS from 'crypto-js';

import { isTrue } from './BooleanUtil';
import { stringify } from './jsonUtils';
import { getRuntimeConfig } from '../config/RuntimeConfig';

// Lazy-resolved: call getRuntimeConfig() at use time so host-side
// configureRuntime({ cryptKey: ... }) can run after module import.
function secretKey(): string {
  return getRuntimeConfig().cryptKey || 'rcm-token-secret';
}

export function encrypt(input: string, compress?: boolean): string {
  let value: string = CryptoJS.AES.encrypt(input, secretKey()).toString();

  if (isTrue(compress)) {
  }

  return value;
}

export function decrypt(ciphertext: string, decompress?: boolean): string {
  let text = ciphertext;

  if (isTrue(decompress)) {
  }

  const bytes = CryptoJS.AES.decrypt(text, secretKey());
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function hash(...input: unknown[]): string {
  let inputs = '';
  const normalized: string[] = [];
  for (let i = 0; i < input.length; i++) {
    let s: string;
    if (input[i] === undefined || input[i] === null) s = '_NULL_';
    else if (typeof input[i] === 'object') s = stringify(input[i]);
    else s = String(input[i]);

    normalized.push(s);
    inputs += s.trim();
  }

  return CryptoJS.SHA256(inputs).toString();
}

export // Generate a UUID v4
function generateUUID(): string {
  const bytes = CryptoJS.lib.WordArray.random(16).words;

  // Convert WordArray to byte array
  const byteArray: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const word = bytes[i]!;
    byteArray.push((word >> 24) & 0xff);
    byteArray.push((word >> 16) & 0xff);
    byteArray.push((word >> 8) & 0xff);
    byteArray.push(word & 0xff);
  }

  // Set the version to 4 (0100)
  byteArray[6] = (byteArray[6]! & 0x0f) | 0x40;
  // Set the variant to 8, 9, A, or B (10xx)
  byteArray[8] = (byteArray[8]! & 0x3f) | 0x80;

  const byteToHex: string[] = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substring(1);
  }

  return (
    byteToHex[byteArray[0]!]! +
    byteToHex[byteArray[1]!]! +
    byteToHex[byteArray[2]!]! +
    byteToHex[byteArray[3]!]! +
    '-' +
    byteToHex[byteArray[4]!]! +
    byteToHex[byteArray[5]!]! +
    '-' +
    byteToHex[byteArray[6]!]! +
    byteToHex[byteArray[7]!]! +
    '-' +
    byteToHex[byteArray[8]!]! +
    byteToHex[byteArray[9]!]! +
    '-' +
    byteToHex[byteArray[10]!]! +
    byteToHex[byteArray[11]!]! +
    byteToHex[byteArray[12]!]! +
    byteToHex[byteArray[13]!]! +
    byteToHex[byteArray[14]!]! +
    byteToHex[byteArray[15]!]!
  );
}
