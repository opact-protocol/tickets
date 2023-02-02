import { client } from "@/services/graphqlClient";
import { gql } from "@apollo/client";

export const getDeposits = async () => {
  const { data } = await client.query({
    query: gql`
      query manyTokens($lastID: String) {
        depositMerkleTreeUpdates(first: 1000, where: { id_gte: "0" }) {
          id
          contract
          signer
          index
          value
        }
      }
    `
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
          contract
          signer
          index
          value
        }
      }
    `
  });
  return data.depositMerkleTreeUpdates;
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
