import { gql } from 'graphql-request';

export const allowListUpdatesQuery = {
  name: 'allowlistMerkleTreeUpdates',
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
};

export const depositUpdatesQuery = {
  name: 'depositMerkleTreeUpdates',
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
};

export const lastAllowListQuery = {
  name: 'allowlistMerkleTreeUpdates',
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
};

export const lastDepositQuery = {
  name: 'depositMerkleTreeUpdates',
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
}
