export const FEE_DIVISOR = 10000;
export const STABLE_LP_TOKEN_DECIMALS = 18;
export const RATED_POOL_LP_TOKEN_DECIMALS = 24;

export function getConfig(
  env: string
) {
  ENV = env;
  switch (env) {
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        WRAP_NEAR_CONTRACT_ID: 'wrap.near',
        REF_FI_CONTRACT_ID: 'v2.ref-finance.near',
        REF_TOKEN_ID: 'token.v2.ref-finance.near',
        indexerUrl: 'https://indexer.ref.finance',
        explorerUrl: 'https://testnet.nearblocks.io',
        REF_DCL_SWAP_CONTRACT_ID: 'dclv2.ref-labs.near',
      };
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        indexerUrl: 'https://testnet-indexer.ref-finance.com',
        WRAP_NEAR_CONTRACT_ID: 'wrap.testnet',
        REF_FI_CONTRACT_ID: 'ref-finance-101.testnet',
        REF_TOKEN_ID: 'ref.fakes.testnet',
        explorerUrl: 'https://testnet.nearblocks.io',
        REF_DCL_SWAP_CONTRACT_ID: 'dclv2.ref-dev.testnet',
      };
    default:
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        REF_FI_CONTRACT_ID: 'v2.ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: 'wrap.near',
        REF_TOKEN_ID: 'token.v2.ref-finance.near',
        indexerUrl: 'https://indexer.ref.finance',
        explorerUrl: 'https://nearblocks.io',
        REF_DCL_SWAP_CONTRACT_ID: 'dcl.ref-labs.near',
      };
  }
}
