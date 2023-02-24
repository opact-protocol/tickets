export interface MerkleTreeStorageInterface {
  __typename: string;
  id: string;
  contract: string;
  index: string;
  signer: string;
  value: string;
  counter: string;
}

export interface MerkleTreeCacheInterface {
  lastIndex: number;
  branches: MerkleTreeStorageInterface[];
}
