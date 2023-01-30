# HYC Subgraph

This is a subgraph implemented using The Graph for NEAR protocol.
The goals of the subgraph are to provide indexed data for both Frontend consumption and analytics consumption.

## Deploying

At the time of writing this document, The Graph Network was still not available for NEAR. Therefore, deployment to production should be done using The Graph's hosted-service.

To deploy a new version of this subgraph to the hosted-service follow the [instructions from The Graph's documentation](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-hosted/)

## Graphql specs

The specs for all entities available in the subgraph can be found in the `schema.graphql` file.

## Main queries

To understand how to query subgraph data, please refer to [The Graph's Documentation](https://thegraph.com/docs/en/querying/querying-the-graph/).

The idea behind the app is that every client must cache the entire merkle trees from the contract in their state. The subgraph can be used to fetch tree data using the following workflow:

1. Find current tree length
```graphql
{
  # This operation will return the id of the most recent
  # update to the allowlistMerkleTree
  allowlistMerkleTreeUpdates(first: 1, orderBy: timestamp, orderDirection: desc) {
    id
  }
}
```

2. Fetch all updates between the last cached update and the result of 1 (it might be necessary to paginate those queries to, v.g. 50 entries per query)
```graphql
{
  # gf
  allowlistMerkleTreeUpdates(skip: $ALREADY_CACHED_ITEMS, first: $PAGINATION_SIZE, orderBy: timestamp, orderDirection: asc) {
    id
    contract
    signer
    index
    value
    account
    allowed
    timestamp
  }
}
```