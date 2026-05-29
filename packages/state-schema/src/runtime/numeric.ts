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
