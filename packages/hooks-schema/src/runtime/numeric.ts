import type { ValueTypeIr } from "../ir.js";

export function decodeNumeric(
  type: Extract<ValueTypeIr, { kind: "u8" | "u16" | "u32" | "u64" }>,
  input: Uint8Array,
  offset: number,
): number | bigint {
  if (type.kind === "u8") return input[offset];

  const view = new DataView(input.buffer, input.byteOffset + offset, type.length);
  const littleEndian = type.endian === "le";
  if (type.kind === "u16") return view.getUint16(0, littleEndian);
  if (type.kind === "u32") return view.getUint32(0, littleEndian);
  return view.getBigUint64(0, littleEndian);
}

export function decodeXflDecimal(enclosing: bigint): string {
  if (enclosing === 0n) return "0";
  if (enclosing >> 63n) return "Invalid XFL";

  const isPositive = ((enclosing >> 62n) & 1n) === 1n;
  const exponent = Number((enclosing >> 54n) & 0xffn) - 97;
  const mantissa = enclosing & ((1n << 54n) - 1n);

  if (mantissa === 0n) return "0";

  const decimal = formatMantissa(mantissa, exponent);
  return isPositive ? decimal : `-${decimal}`;
}

function formatMantissa(mantissa: bigint, exponent: number): string {
  const digits = mantissa.toString();

  if (exponent >= 0) return `${digits}${"0".repeat(exponent)}`;

  const pointIndex = digits.length + exponent;
  if (pointIndex > 0) {
    return trimDecimal(`${digits.slice(0, pointIndex)}.${digits.slice(pointIndex)}`);
  }

  return trimDecimal(`0.${"0".repeat(Math.abs(pointIndex))}${digits}`);
}

function trimDecimal(decimal: string): string {
  return decimal.replace(/\.?0+$/, "");
}
