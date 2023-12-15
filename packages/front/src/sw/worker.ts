import { getUserBalanceBySecret } from '../opact'

self.addEventListener("message", async (event: any) => {
  try {
    const {
      config,
      secret,
      currentId,
      storedUtxos,
    } = event.data.input as any;

    const {
      lastId,
      receipts,
      treeBalances,
      encryptedUtxos,
    } = await getUserBalanceBySecret(
      config,
      secret,
      currentId,
      storedUtxos,
    )

    self.postMessage(
      {
        type: "done",
        payload: {
          lastId,
          receipts,
          treeBalances,
          encryptedUtxos,
        }
      } as any
    );
  } catch (e) {
    console.warn('[Retry] Compute data error: ', e)

    self.postMessage(
      {
        type: "error",
        payload: {
          e
        }
      } as any
    );
  }
});

export {};
