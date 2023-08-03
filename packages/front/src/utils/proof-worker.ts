// @ts-ignore
import createWorker from 'worker-module:../sw/worker';

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
