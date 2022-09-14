import { Near, connect } from 'near-api-js';

const NEAR_CONFIG = {
    networkId: "testnet",
    nodeUrl: "https://archival-rpc.testnet.near.org",
};

export const nearRpcClient: Near = await connect(NEAR_CONFIG);
