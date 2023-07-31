// @ts-ignore
import createWorker from 'worker-module:../sw/worker';
import { artifactStore } from "@/utils/artifact-store";

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

export function createProofWorker() {
  const worker = new createWorker()

  const buildProof = ({
    zkey,
    payload,
    verifierUrl,
    callbackProgress
  }: any) => {
    return new Promise<Blob[]>((resolve, reject) => {
      worker.postMessage({
        input: {
          zkey,
          input: payload,
          wasm: new URL(verifierUrl, window.location.origin).toString(),
        }
      })

      worker.addEventListener("message", (event: any) => {
        if (event.data.type === 'progress') {
          callbackProgress(event.data.payload)

          return
        }

        console.log('Worker PostMessage Event', event)

        switch (event.data.type) {
          case "done":
            resolve(event.data)
            break;

          case "error":
            reject(event.data)
            break;
          default:
            break;
        }
      });
    });
  }

  return {
    worker,
    handlers: {
      buildProof,
    }
  }
}
