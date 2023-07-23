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
  const worker = new Worker(new URL('../workers/proof.ts', import.meta.url), { type: 'module' })

  const buildProof = ({
    payload,
    verifierUrl,
    circuitUrl,
    callbackProgress
  }: any) => {
    return new Promise<Blob[]>((resolve, reject) => {
      worker.postMessage({
        input: {
          payload: payload,
          verifierUrl: new URL(verifierUrl, window.location.origin).toString(),
          circuitUrl: new URL(circuitUrl, window.location.origin).toString(),
        }
      })

      worker.addEventListener("message", (event: any) => {
        if (event.data.type === 'progress') {
          callbackProgress(event.data.payload)

          return
        }

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
