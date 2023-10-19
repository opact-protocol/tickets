import { gql } from "graphql-request";

/**
 * @constant allowListUpdatesQuery The query to get all allowlist branches to make the merkle tree
 */
export const allowListUpdatesQuery = {
  name: "allowlistMerkleTreeUpdates",
  query: gql`
    query manyTokens($startId: String, $len: String, $contract: String) {
      allowlistMerkleTreeUpdates(
        first: $len
        where: { contract: $contract, counter_gte: $startId }
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
};

/**
 * @constant depositUpdatesQuery The query to get all deposit branches to make the merkle tree
 */
export const depositUpdatesQuery = {
  name: "depositMerkleTreeUpdates",
  query: gql`
    query manyTokens($startId: String, $len: String, $contract: String) {
      depositMerkleTreeUpdates(
        first: $len
        where: { contract: $contract, counter_gte: $startId }
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
};

/**
 * @constant allowListUpdatesQuery The query to get the last allowlist branch to make the merkle tree
 */
export const lastAllowListQuery = {
  name: "allowlistMerkleTreeUpdates",
  query: gql`
    query lastAllowList($contract: String) {
      allowlistMerkleTreeUpdates(
        first: 1
        where: { contract: $contract }
        orderBy: timestamp
        orderDirection: desc
      ) {
        counter
      }
    }
  `,
};

/**
 * @constant allowListUpdatesQuery The query to get the last deposit branch to make the merkle tree
 */
export const lastDepositQuery = {
  name: "depositMerkleTreeUpdates",
  query: gql`
    query lastDeposit($contract: String) {
      depositMerkleTreeUpdates(
        first: 1
        where: { contract: $contract }
        orderBy: timestamp
        orderDirection: desc
      ) {
        counter
      }
    }
  `,
};
