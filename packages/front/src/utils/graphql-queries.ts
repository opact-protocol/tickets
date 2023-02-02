import { client } from "@/services/graphqlClient";
import { gql } from "@apollo/client";

export const getDeposits = async (startId: string, len: string) => {
  const { data } = await client.query({
    query: gql`
      query manyTokens($startId: String, $len: String) {
        depositMerkleTreeUpdates(first: $len, where: { id_gt: $startId }) {
          id
          contract
          signer
          index
          value
        }
      }
    `,
    variables: {
      startId,
      first: len
    }
  });

  return data.depositMerkleTreeUpdates;
};

export const getAllowLists = async (startId: string, len: string) => {
  const { data } = await client.query({
    query: gql`
      query manyTokens($startId: String, $len: String) {
        allowlistMerkleTreeUpdates(first: $len, where: { id_gt: $startId }) {
          id
          contract
          signer
          index
          value
        }
      }
    `,
    variables: {
      startId,
      first: len
    }
  });
  return data.allowlistMerkleTreeUpdates;
};

export const getLastDeposit = async () => {
  const { data } = await client.query({
    query: gql`
      query lastDeposit {
        depositMerkleTreeUpdates(
          first: 1
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
        }
      }
    `
  });
  return data.depositMerkleTreeUpdates[0].id;
};

export const getLastAllowlist = async () => {
  const { data } = await client.query({
    query: gql`
      query lastAllowList {
        allowlistMerkleTreeUpdates(
          first: 1
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
        }
      }
    `
  });
  return data.allowlistMerkleTreeUpdates[0].id;
};
