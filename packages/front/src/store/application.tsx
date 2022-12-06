import create from "zustand";
import { groth16 } from "snarkjs";
import toast from "react-hot-toast";
import { randomBN } from "@/utils/crypto-utils";
import {
  getTransaction,
  executeMultipleTransactions,
  viewFunction,
} from "@/utils/tools";
import { mimc } from "@/services/mimc";
import { buildTree, api } from "@/services";

const DEFAULT_HASH_DATA = {
  amount: 1,
  relayer_fee: 0.2,
  tokens_to_receive: 0.8,
  timestamp: Date.now(),
};

function parseNote(note: string): {
  secret: string;
  nullifier: string;
  account_hash: string;
} {
  const splitString = note.split("-");
  return {
    secret: splitString[0],
    nullifier: splitString[1],
    account_hash: splitString[2],
  };
}

const CONTRACT = "hycatnear.testnet";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useApplication = create<{
  proof: any;
  publicArgs: any;
  hash: any;
  note: any;
  sendDeposit: (connection: any, account: string) => Promise<void>;
  fetchHashData: () => Promise<any>;
  sendWithdraw: (connection: any, account: string) => Promise<void>;
  prepareWithdraw: (connection, payload: any) => Promise<void>;
  prepareDeposit: (connection: any, account: string) => Promise<string>;
  createSnarkProof: (payload: any) => Promise<any>;
  sendWhitelist: (connection: any, account: string) => Promise<any>;
}>((set, get) => ({
  proof: null,
  publicArgs: null,
  hash: null,
  note: null,

  prepareDeposit: async (connection, account) => {
    const wallet = await connection.wallet();

    const secret = randomBN();
    const nullifier = randomBN();

    const secrets_hash = mimc.hash!(secret, nullifier);

    const account_hash = await viewFunction(
      connection,
      CONTRACT,
      "view_account_hash",
      {
        account_id: account,
      }
    );

    const commitment = mimc.hash(secrets_hash, account_hash);
    console.log({
      secret,
      nullifier,
      secrets_hash,
      account_hash,
      commitment,
    });

    const note =
      secret.toString() +
      "-" +
      nullifier.toString() +
      "-" +
      account_hash.toString();

    set({
      hash: secrets_hash,
      note,
    });

    return secrets_hash;
  },

  sendDeposit: async (connection, account) => {
    const wallet = await connection.wallet();

    let transactions: any[] = [];

    transactions.push(
      getTransaction(
        account,
        CONTRACT,
        "deposit",
        {
          secrets_hash: get().hash,
        },
        "10000000000000000000000000"
      )
    );

    executeMultipleTransactions(transactions, wallet);
  },

  fetchHashData: async () => {
    await delay(1000);

    return {
      ...DEFAULT_HASH_DATA,
    };
  },

  prepareWithdraw: async (connection, { note, recipient }) => {
    const { createSnarkProof } = get();

    const recipientHash = await viewFunction(
      connection,
      CONTRACT,
      "view_account_hash",
      {
        account_id: recipient,
      }
    );

    try {
      const parsedNote = parseNote(note);

      const secretsHash = mimc.hash(parsedNote.secret, parsedNote.nullifier);
      const commitment = mimc.hash(secretsHash, parsedNote.account_hash);

      console.log({ secretsHash, commitment });

      const { commitmentsTree, whitelistTree } = await buildTree();

      const commitmentProof = commitmentsTree.proof(commitment);
      const whitelistProof = whitelistTree.proof(parsedNote.account_hash);

      let input = {
        root: commitmentProof.pathRoot,
        nullifierHash: mimc.singleHash!(parsedNote.nullifier),
        recipient: recipientHash, // not taking part in any computations
        relayer: "0", // not taking part in any computations
        fee: "0", // not taking part in any computations
        refund: "0", // not taking part in any computations
        nullifier: parsedNote.nullifier,
        secret: parsedNote.secret,
        pathElements: commitmentProof.pathElements,
        pathIndices: commitmentProof.pathIndices,

        // reference to current whitelist Merkle Tree
        whitelistRoot: whitelistProof.pathRoot,
        // reference to original depositor to enforce whitelist
        originDepositor: parsedNote.account_hash,
        whitelistPathElements: whitelistProof.pathElements,
        whitelistPathIndices: whitelistProof.pathIndices,
      };

      // const { tree, root } = await buildTree(parseNote);

      const { proof, publicSignals } = await createSnarkProof(input);

      let publicArgs = {
        root: publicSignals[0],
        nullifier_hash: publicSignals[1],
        recipient: recipient,
        relayer: null,
        fee: publicSignals[4],
        refund: publicSignals[5],
        whitelist_root: publicSignals[6],
        proof: {
          a: {
            x: proof["pi_a"][0],
            y: proof["pi_a"][1],
          },
          b: {
            x: proof["pi_b"][0],
            y: proof["pi_b"][1],
          },
          c: {
            x: proof["pi_c"][0],
            y: proof["pi_c"][1],
          },
        },
      };

      console.timeEnd("SNARK proof time");

      set({
        proof,
        publicArgs,
      });
    } catch (e: any) {
      console.error("prepareWithdraw", e);

      throw new Error(e.message);
    }
  },

  sendWithdraw: async (connection, account) => {
    await delay(1000);

    const wallet = await connection.wallet();

    let transactions: any[] = [];

    let publicArgs = get().publicArgs;
    let proof = get().proof;

    // try {
    //   await api.post("/money/withdraw", {
    //     proof,
    //     ...publicArgs,
    //   });

    //   toast.success("Withdraw sended!");
    // } catch(e) {
    //   toast.error("Error on withdraw");
    // }

    transactions.push(
      getTransaction(
        account,
        CONTRACT,
        "withdraw",
        {
          proof,
          ...publicArgs,
        },
        "0"
      )
    );

    executeMultipleTransactions(transactions, wallet);

    toast.success("Withdraw sended!");
  },

  createSnarkProof: async (input) => {
    // _input, wasmFile, zkeyFileName, logger
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      "./withdraw.wasm",
      "./withdraw_0001.zkey"
    );

    return { proof, publicSignals };
  },

  sendWhitelist: async (connection, accountId) => {
    const wallet = await connection.wallet();

    let transactions: any[] = [];

    transactions.push(
      getTransaction(
        accountId,
        "authorizer.testnet",
        "whitelist",
        {
          account: accountId,
          auth_code: "nearcon",
        },
        ""
      )
    );

    executeMultipleTransactions(transactions, wallet);
  },
}));
