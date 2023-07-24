import { debounce } from "../utils/debounce";
import { getProof } from "../utils/sdk";

export type FileWorkerInput = {
  type: "single_file";
  input: {
    file: File;
    chunkSize: number;
  };
};

export type FileWorkerEventType = MessageEvent<FileWorkerInput>;

export type FileWorkerMessage =
  | {
      type: "done";
      payload: {
        progress: number;
        chunks: Blob[];
      };
    }
  | {
      type: "error";
      payload: {
        error: string;
      };
    };

self.addEventListener("message", async (event: any) => {
  try {
    const { payload, verifierUrl, circuitUrl } = event.data.input as any;

    self.postMessage({
      type: "progress",
      payload: 'start'
    })

    const res = await getProof({
      payload,
      circuitUrl,
      verifierUrl,
      logger: {
        debug: debounce((message: string) => {
          self.postMessage({
            type: "progress",
            payload: message
          })

          return message
        }, 100)
      }
    });

    self.postMessage(
      {
        type: "done",
        payload: res
      } as any
    );
  } catch (error) {
    self.postMessage(
      {
        type: "error",
        payload: {
          error
        }
      } as any
    );
  }
});

export {};
