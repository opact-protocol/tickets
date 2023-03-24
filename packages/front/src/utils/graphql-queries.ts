import { useEnv } from "@/hooks/useEnv";
import { gql, request } from "graphql-request";

interface Storage {
  __typename: string;
  id: string;
  contract: string;
  index: string;
  signer: string;
  value: string;
  counter: string;
}

const graphqlUrl = useEnv("VITE_API_GRAPHQL_URL");

export const getAllowLists = async (
  startId: string,
  len: string
): Promise<Storage[]> => {
  const data = await request(
    graphqlUrl,
    gql`
      query manyTokens($startId: String, $len: String) {
        allowlistMerkleTreeUpdates(
          first: $len
          where: { counter_gte: $startId }
          orderBy: counter
          orderDirection: asc
        ) {
          id
          contract
          signer
          index
          value
          counter
        }
      }
    `,
    {
      startId,
      first: len,
    },
  ) as any;

  return data.allowlistMerkleTreeUpdates;
};

export const getLastDepositOfContract = async (contract: string) => {
  const data = await request(
    graphqlUrl,
    gql`
      query currentGraetestCounter($contract: String) {
        depositMerkleTreeUpdates(
          first: 1
          orderBy: counter
          orderDirection: desc
          where: { contract: $contract }
        ) {
          contract
          counter
          timestamp
        }
      }
    `,
    {
      contract,
    },
  ) as any;

  return data.depositMerkleTreeUpdates;
};

export const getLastWithdrawalOfContract = async (contract: string) => {
  const data = await await request(
    graphqlUrl,
    gql`
      query mostRecentWithdraw {
        withdrawals(
          first: 1
          orderBy: timestamp
          orderDirection: desc
          where: { contract: $contract }
        ) {
          counter
          timestamp
        }
      }
    `,
    { contract },
  ) as any;

  return data.withdrawals;
};

export const getLastAllowlist = async (): Promise<string> => {
  const data = await request(
    graphqlUrl,
    gql`
      query lastAllowList {
        allowlistMerkleTreeUpdates(
          first: 1
          orderBy: timestamp
          orderDirection: desc
        ) {
          counter
        }
      }
    `,
  ) as any;

  return data.allowlistMerkleTreeUpdates[0].counter;
};

export const getTicketInTheMerkleTree = async (commitment: string) => {
  const data = await request(
    graphqlUrl,
    gql`
      query ticketInTheMerkleTree($commitment: String) {
        depositMerkleTreeUpdates(where: { value: $commitment }) {
          contract
          counter
          timestamp
          value
        }
      }
    `,
    {
      commitment,
    },
  ) as any;

  return data.depositMerkleTreeUpdates[0];
};

export const getLastDepositsBeforeTheTicketWasCreated = async (
  timestamp: string
) => {
  const data = await request(
    graphqlUrl,
    gql`
      query lastDeposits($timestamp: String) {
        depositMerkleTreeUpdates(
          first: 1
          where: { timestamp_lte: $timestamp }
          orderBy: counter
          orderDirection: desc
        ) {
          counter
          timestamp
        }
      }
    `,
    { timestamp },
  ) as any;

  if (data.depositMerkleTreeUpdates[0]) {
    return data.depositMerkleTreeUpdates[0];
  }

  return 0;
};

export const getLastWithdrawBeforeTheTicketWasCreated = async (
  timestamp: string
) => {
  const data = await request(
    graphqlUrl,
    gql`
      query teste($timestamp: String) {
        withdrawals(
          first: 1
          where: { timestamp_lte: $timestamp }
          orderBy: counter
          orderDirection: desc
        ) {
          counter
          timestamp
        }
      }
    `,
    { timestamp },
  ) as any;

  if (data.withdrawals[0]) {
    return data.withdrawals[0];
  }

  return 0;
};
