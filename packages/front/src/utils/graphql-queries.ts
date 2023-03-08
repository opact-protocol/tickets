import { client } from "@/services/graphqlClient";
import { gql } from "@apollo/client";

interface Storage {
  __typename: string;
  id: string;
  contract: string;
  index: string;
  signer: string;
  value: string;
  counter: string;
}

export const getDeposits = async (
  startId: string,
  len: string
): Promise<Storage[]> => {
  // const counter = startId === "0" ? "-1" : startId;

  const { data } = await client.query({
    query: gql`
      query manyTokens($startId: String, $len: String) {
        depositMerkleTreeUpdates(
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
    variables: {
      startId,
      first: len,
    },
  });

  return data.depositMerkleTreeUpdates;
};

export const getAllowLists = async (
  startId: string,
  len: string
): Promise<Storage[]> => {
  // const counter = startId === "0" ? "-1" : startId;

  const { data } = await client.query({
    query: gql`
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
    variables: {
      startId,
      first: len,
    },
  });
  return data.allowlistMerkleTreeUpdates;
};

export const getLastDeposit = async (): Promise<string> => {
  const { data } = await client.query({
    query: gql`
      query lastDeposit {
        depositMerkleTreeUpdates(
          first: 1
          orderBy: timestamp
          orderDirection: desc
        ) {
          counter
        }
      }
    `,
  });
  return data.depositMerkleTreeUpdates[0].counter;
};

export const getLastAllowlist = async (): Promise<string> => {
  const { data } = await client.query({
    query: gql`
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
  });
  return data.allowlistMerkleTreeUpdates[0].counter;
};

export const getTicketInTheMerkleTree = async (commitment: string) => {
  const { data } = await client.query({
    query: gql`
      query ticketInTheMerkleTree($commitment: String) {
        depositMerkleTreeUpdates(where: { value: $commitment }) {
          contract
          counter
          timestamp
        }
      }
    `,
    variables: {
      commitment,
    },
  });

  return data.depositMerkleTreeUpdates[0];
};

export const getLastWithdrawBeforeTheTicketWasCreated = async (
  timestamp: string
) => {
  const { data } = await client.query({
    query: gql`
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
    variables: { timestamp },
  });

  if (data.withdrawals[0]) return data.withdrawals[0];
  else return 0;
};
export const GET_MOST_RECENT_DEPOSIT = gql`
  query currentGraetestCounter {
    depositMerkleTreeUpdates(first: 1, orderBy: counter, orderDirection: desc) {
      counter
      timestamp
    }
  }
`;

export const GET_MOST_RECENT_WITHDRAW = gql`
  query mostRecentWithdraw {
    withdrawals(first: 1, orderBy: timestamp, orderDirection: desc) {
      counter
      timestamp
    }
  }
`;
