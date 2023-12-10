import { getUserBalanceBySecret, getUserReceiptsBySecret } from '../opact'

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

    const receipts = await getUserReceiptsBySecret(
      secret,
      currentId,
      storedReceipts
    )

    self.postMessage(
      {
        type: "done",
        payload: {
          lastId,
          receipts,
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
