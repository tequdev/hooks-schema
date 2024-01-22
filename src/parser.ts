import { hexToXfl } from "@transia/hooks-toolkit/dist/npm/src/libs/binary-models";
import { encodeAccountID } from "@transia/xrpl";
import { HookState } from "@transia/xrpl/dist/npm/models/ledger";
import { HookStateDataType, HookStateDefinition, HookStateKeyType } from "./schema";

const getByteLength = (state: HookStateKeyType | HookStateDataType) => {
  switch (state.type) {
    case "AccountID":
      return 20;
    case "UInt8":
      return 1;
    case "UInt16":
      return 2;
    case "UInt32":
      return 4;
    case "UInt64":
      return 8
    case "XFL":
      return 8;
    case "VarString":
      return state.byte_length;
    case "Hash256":
      return 32;
    default:
      throw new Error("Invalid type");
  }
};

const bufferToReadableData = (buffer: Buffer, state: HookStateDataType | HookStateKeyType) => {
  switch (state.type) {
    case "AccountID":
      return encodeAccountID(buffer);
    case "UInt8":
      return buffer.readUInt8();
    case "UInt16":
      return buffer.readUInt16LE();
    case "UInt32":
      return buffer.readUint32LE()
    case "UInt64":
      return buffer.readBigUint64LE()
    case "XFL":
      return hexToXfl(buffer.toString("hex"));
    case "VarString":
      if (state.binary === true) return buffer.toString("hex");
      return buffer.toString().replace(/\0/g, "");
    case "Hash256":
      return buffer.toString("hex");
    default:
      throw new Error("Invalid type");
  }
};

const stateDataTotalLength = (data: HookStateDefinition['hook_states'][number]) => {
  return data.hookstate_data.reduce((total, cur) => total + getByteLength(cur), 0);
}

type ReadableData = {
  [key: string]: string | number | bigint;
};


export const parser = (value: HookState, definition: HookStateDefinition) => {
  const key = Buffer.from(value.HookStateKey, "hex");
  const data = Buffer.from(value.HookStateData, "hex");
  // console.log(value)
  const state = definition.hook_states
    .map((state) => {
      if (data.length !== stateDataTotalLength(state)) return undefined;

      let lastKeyIndex = 0;
      const keyArr: ReadableData[] = [];
      // console.log(state.hookstate_key)
      const checkKey = state.hookstate_key.every((k) => {
        // Retrieve info matching HookStateKey and length with definition
        const currentKeyIndex = getByteLength(k);
        const currentBuffer = key.subarray(lastKeyIndex, lastKeyIndex + currentKeyIndex);
        lastKeyIndex += currentKeyIndex;
        const readable = bufferToReadableData(currentBuffer, k)
        // console.log(lastKeyIndex, lastKeyIndex + currentKeyIndex, readable)
        if (!k.fixed_value) {
          if (k.exclude === true) return true;
          keyArr.push({
            name: k.name,
            value: readable,
          });
          return true;
        }
        if (readable !== k.fixed_value && currentBuffer.toString("utf-8").replace(/\0/g, "0") !== k.fixed_value) return false;
        if (k.exclude === true) return true;
        keyArr.push({
          name: k.name,
          value: readable,
        });
        return true;
      });
      if (checkKey === false) return undefined;
      let lastDataIndex = 0;
      const dataArr: ReadableData[] = [];
      const checkData = state.hookstate_data.every((d) => {
        // Retrieve info matching HookStateData and length with definition
        const currentDataIndex = getByteLength(d);
        const currentBuffer = data.subarray(lastDataIndex, lastDataIndex + currentDataIndex);
        lastDataIndex += currentDataIndex;
        const readable = bufferToReadableData(currentBuffer, d)
        // console.log(lastDataIndex - currentDataIndex, lastDataIndex, readable, currentBuffer)

        if (!d.fixed_value) {
          if (d.exclude === true) return true;
          dataArr.push({
            name: d.name,
            value: readable,
          });
          return true;
        }
        if (readable !== d.fixed_value && currentBuffer.toString("utf-8").replace(/\0/g, "0") !== d.fixed_value) return false;
        if (d.exclude === true) return true;
        dataArr.push({
          name: d.name,
          value: readable,
        });
        return true;
      });

      return checkData ? { name: state.name, key: keyArr, data: dataArr } : undefined;
    })
    .filter((d): d is NonNullable<typeof d> => typeof d !== "undefined")
    .find((_) => true);
  return state;
};
