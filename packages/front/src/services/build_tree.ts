import { MerkleTree } from "fixed-merkle-tree";
import { mimc } from "./mimc";
import { nearRpcClient } from "./near_rpc";

const EVENT_PREFIX = "EVENT_JSON:";
const EVENT_STANDARD = "hideyour.cash";

const VERCEL_URL = "https://monorepo-hideyour-cash.vercel.app/api/query";

const MERKLE_TREE_OPTIONS = {
  zeroElement:
    "21663839004416932945382355908790599225266501822907911457504978515578255421292",
  hashFunction: mimc.hash,
};

const eventTypes = {
  deposit: "deposit",
  updated_whitelist: "whitelist",
};

export async function buildTree() {
  await mimc.initMimc();
  const txResponse = await fetch(VERCEL_URL);
  const { body: transactions } = await txResponse.json();

  const finalExecutionOutcomes = await Promise.all(
    transactions.map(
      ({ transaction_hash: txHash, predecessor_account_id: signerId }) =>
        nearRpcClient.connection.provider.txStatusReceipts(txHash, signerId)
    )
  );

  const logs = finalExecutionOutcomes
    .flatMap((feo) =>
      feo.receipts_outcome.flatMap((receipt) => receipt.outcome.logs)
    )
    .filter((logs) => logs.length > 0);

  const events = logs
    .map((log) => log.slice(EVENT_PREFIX.length))
    .map((log) => JSON.parse(log))
    .filter((event) => (event.standard = EVENT_STANDARD))
    .filter((event) => (event.version = "1.0.0"))
    .reduce(
      (res, event) => {
        const eventType = eventTypes[event.event];

        if (!eventType) {
          return res;
        }

        res[eventTypes[event.event]].push(event);

        return res;
      },
      {
        deposit: [],
        whitelist: [],
      }
    );

  events.deposit.sort((a, b) =>
    Number(a.data[0].index) > Number(b.data[0].index) ? 1 : -1
  );
  events.whitelist.sort((a, b) =>
    Number(a.data[0].index) > Number(b.data[0].index) ? 1 : -1
  );

  const commitmentsTree = new MerkleTree(20, [], MERKLE_TREE_OPTIONS);

  events.deposit.forEach(({ data }) => {
    const { index, value } = data[0];

    try {
      commitmentsTree.update(index, value);
    } catch (e) {
      console.warn(e);
    }
  });

  const whitelistTree = new MerkleTree(20, [], MERKLE_TREE_OPTIONS);

  events.whitelist.forEach(({ data }) => {
    const { index, value } = data[0];

    try {
      whitelistTree.update(index, value);
    } catch (e) {
      console.warn(e);
    }
  });

  return { commitmentsTree, whitelistTree };
}
