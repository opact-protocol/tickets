import {
  isDefined,
  promiseTimeout,
} from '@railgun-community/shared-models';
import axios, { ResponseType } from 'axios';
import { artifactStore } from './artifact-store';
// import brotliDecompress from 'brotli/decompress';

export const getArtifactData = (
  data: string | ArrayBuffer,
): string | Uint8Array => decompressArtifact(data as ArrayBuffer)

export const decompressArtifact = (arrayBuffer: ArrayBuffer): Uint8Array => {
  const decompress = brotliDecompress as (input: Uint8Array) => Uint8Array;

  return decompress(Buffer.from(arrayBuffer));
};

export const loadArtifacts = async (): Promise<void> => {
  await promiseTimeout(
    Promise.all([
      loadArtifact(),
    ]),
    45000,
    new Error(
      `Timed out downloading artifact files for ZKEY circuit. Please try again.`,
    ),
  );
}

export const loadArtifact = async() => {
  const path = '/circuit.zkey';

  if (await artifactStore.exists(path)) {
    return path;
  }

  try {
    const result = await axios.get(path, {
      method: 'GET',
      responseType: 'arraybuffer',
    });

    const data: ArrayBuffer = result.data;

    // NodeJS downloads as Buffer.
    // Browser downloads as ArrayBuffer.
    // Both will validate with the same hash.
    // const dataFormatted: ArrayBuffer | Buffer | string =
      // data instanceof ArrayBuffer || data instanceof Buffer
      //   ? data
      //   : JSON.stringify(data);

    // const decompressedData = getArtifactData(
    //   dataFormatted,
    // );

    console.log('fooo')

    await artifactStore.store(
      'zkey:',
      path,
      new Uint8Array(data),
    );

    return path;
  } catch (err: any) {
    console.warn(err)
  }
}
