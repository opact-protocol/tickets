import { gql } from 'graphql-request';

// hyc registry
export const allowListUpdatesQuery = {
  name: 'allowlistMerkleTreeUpdates',
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

// hyc10.testnet
export const depositUpdatesQuery = {
  name: 'depositMerkleTreeUpdates',
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

// hyc registry
export const lastAllowListQuery = {
  name: 'allowlistMerkleTreeUpdates',
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

export const lastDepositQuery = {
  name: 'depositMerkleTreeUpdates',
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
}
