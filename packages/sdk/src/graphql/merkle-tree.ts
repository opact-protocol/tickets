import gql from 'graphql-tag';

export const allowListUpdatesQuery = gql`
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
`;

export const depositUpdatesQuery = gql`
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
`;

export const lastAllowListQuery = gql`
  query lastAllowList {
    allowlistMerkleTreeUpdates(
      first: 1
      orderBy: timestamp
      orderDirection: desc
    ) {
      counter
    }
  }
`;

export const lastDepositQuery = gql`
  query lastDeposit {
    depositMerkleTreeUpdates(
      first: 1
      orderBy: timestamp
      orderDirection: desc
    ) {
      counter
    }
  }
`;
