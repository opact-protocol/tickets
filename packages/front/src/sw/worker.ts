import { getUserBalanceBySecret } from '../opact'

self.addEventListener("message", async (event: any) => {
  try {
    const {
      secret,
      currentId,
      storedUtxos,
      storedReceipts,
    } = event.data.input as any;

    const {
      lastId,
      treeBalances,
    } = await getUserBalanceBySecret(
      secret,
      currentId,
      storedUtxos,
    )

    self.postMessage(
      {
        type: "done",
        payload: {
          lastId,
          treeBalances
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
