import axios from 'axios';
import { artifactStore } from './artifact-store';

export const loadArtifacts = async (): Promise<void> => {
  await Promise.all([
    loadArtifact(),
  ])
}

export const loadArtifact = async() => {
  const path = '/circuit.zkey';

  if (await artifactStore.exists(path)) {
    return path;
  }

  try {
    let result

    try {
      result = await axios.get(path, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' },
        responseType: 'arraybuffer',
      });
    } catch (e) {
      try {
        result = await axios.get(path, {
          method: 'GET',
          responseType: 'arraybuffer',
        });
      } catch(e) {
        // throw new Error(e.message)
        console.warn(e)
      }
    }

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

    await artifactStore.store(
      'zkey',
      path,
      new Uint8Array(data),
    );

    return path;
  } catch (err: any) {
    console.warn(err)
  }
}
