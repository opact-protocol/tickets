import create from "zustand";
import { plonk } from "snarkjs";
import { randomBN } from "@/utils/crypto-utils";
import {
  getTransaction,
  executeMultipleTransactions,
  viewFunction,
} from "@/utils/tools";
import { mimc } from "@/services/mimc";
import { buildTree } from "@/services";
import { useEnv } from "@/hooks/useEnv";
import axios from "axios";

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

const CONTRACT = useEnv("VITE_CONTRACT");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useApplication = create<{
  proof: any;
  publicArgs: any;
  hash: any;
  note: any;
  sendDeposit: (
    connection: any,
    account: string,
    amount: string
  ) => Promise<void>;
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

  sendDeposit: async (connection: any, account: string, amount: string) => {
    const wallet = await connection.wallet();

    const transactions: any[] = [];

    transactions.push(
      getTransaction(
        account,
        CONTRACT,
        "deposit",
        {
          secrets_hash: get().hash,
        },
        amount
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

      const input = {
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

      const publicArgs = {
        root: publicSignals[0],
        nullifier_hash: publicSignals[1],
        recipient: recipient,
        relayer: null,
        fee: publicSignals[4],
        refund: publicSignals[5],
        allowlist_root: publicSignals[6],
        a: {
          x: proof["A"][0],
          y: proof["A"][1],
        },
        b: {
          x: proof["B"][0],
          y: proof["B"][1],
        },
        c: {
          x: proof["C"][0],
          y: proof["C"][1],
        },
        z: {
          x: proof["Z"][0],
          y: proof["Z"][1],
        },
        t_1: {
          x: proof["T1"][0],
          y: proof["T1"][1],
        },
        t_2: {
          x: proof["T2"][0],
          y: proof["T2"][1],
        },
        t_3: {
          x: proof["T3"][0],
          y: proof["T3"][1],
        },
        eval_a: proof["eval_a"],
        eval_b: proof["eval_b"],
        eval_c: proof["eval_c"],
        eval_s1: proof["eval_s1"],
        eval_s2: proof["eval_s2"],
        eval_zw: proof["eval_zw"],
        eval_r: proof["eval_r"],
        wxi: {
          x: proof["Wxi"][0],
          y: proof["Wxi"][1],
        },
        wxi_w: {
          x: proof["Wxiw"][0],
          y: proof["Wxiw"][1],
        },
      };

      console.timeEnd("SNARK proof time");

      set({
        proof,
        publicArgs,
      });
    } catch (e) {
      console.error("prepareWithdraw", e);

      if (e instanceof Error) {
        throw new Error(e.message);
      }
    }
  },

  sendWithdraw: async (connection, account) => {
    // await delay(1000);

    // const wallet = await connection.wallet();

    // const transactions: any[] = [];

    // const publicArgs = get().publicArgs;
    // const proof = get().proof;

    // transactions.push(
    //   getTransaction(account, CONTRACT, "withdraw", publicArgs, "0")
    // );

    // await executeMultipleTransactions(transactions, wallet);

    await relayer.post("/relay", publicArgs);
  },

  createSnarkProof: async (input) => {
    // _input, wasmFile, zkeyFileName, logger
    const { proof, publicSignals } = await plonk.fullProve(
      input,
      "./verifier.wasm",
      "./circuit.zkey"
    );

    return { proof, publicSignals };
  },

  sendWhitelist: async (connection, accountId) => {
    const wallet = await connection.wallet();

    const transactions: any[] = [];

    transactions.push(
      getTransaction(
        accountId,
        CONTRACT,
        "allowlist",
        {
          account_id: accountId,
          auth_code: "nearcon",
        },
        ""
      )
    );
    await executeMultipleTransactions(transactions, wallet);
  },
}));
