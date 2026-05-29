import { DecodeInputError } from "../errors.js";

export function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith("0x") || hex.startsWith("0X")) {
    throw new DecodeInputError("hex input must not include 0x prefix");
  }
  if (/\s/.test(hex)) {
    throw new DecodeInputError("hex input must not include whitespace");
  }
  if (hex.length % 2 !== 0) {
    throw new DecodeInputError("hex input must have an even number of characters");
  }
  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    throw new DecodeInputError("hex input contains non-hex characters");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function asciiToBytesHex(value: string): string {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code > 0x7f) {
      throw new Error("String pattern must be ASCII");
    }
    bytes[index] = code;
  }
  return bytesToHex(bytes);
}

export function isAscii(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (value.charCodeAt(index) > 0x7f) return false;
  }
  return true;
}

export function isHex(value: string): boolean {
  return value.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(value);
}
