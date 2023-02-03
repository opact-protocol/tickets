import { client } from "@/services/graphqlClient";
import { gql } from "@apollo/client";

export const getDeposits = async (startID: string, len: number) => {
  const { data } = await client.query({
    query: gql`
      query manyTokens($startID: String, $len: Number) {
        depositMerkleTreeUpdates(first: $len, where: { id_gt: $startID }) {
          id
          contract
          signer
          index
          value
        }
      }
    `,
    {
      lastID, len 
    }
  });

  return data.depositMerkleTreeUpdates;
};

export const getAllowLists = async () => {
  const { data } = await client.query({
    query: gql`
      query manyTokens($lastID: String) {
        allowlistMerkleTreeUpdates(first: 1000, where: { id_gte: "0" }) {
          id
          contract
          signer
          index
          value
        }
      }
    `
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
          contract
          signer
          index
          value
        }
      }
    `
  });
  return data.allowlistMerkleTreeUpdates;
};
