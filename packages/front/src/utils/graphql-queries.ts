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
