import localforage from 'localforage';

export const artifactStore = {
  async get (path: string): Promise<string | Buffer | null> {
    return localforage.getItem(path);
  },

  async store (
    dir: string,
    path: string,
    item: string | Uint8Array
  ) {
    return await localforage.setItem(path, item);
  },

  async exists (path: string): Promise<boolean> {
    return (await localforage.getItem(path)) != null
  }
}

