import type { QueuedData } from "./utils";
import type { Env } from "./env";

import { setupNear, viewFunction } from "./utils";

export const consumer = async (message: QueuedData, env: Env) => {
    console.log("dummy");
}

// this function must perform a view call to contract to fetch
// accepted risk parameters
// there is currently no such view call in the contract. Mock
// values for now
const fetchRiskParams = async (): Promise<any> => {
    console.log("dummy")
}

// this function must sign and send a denylist transaction
// to the contract
const sendBanTransaction = async (env: Env): Promise<void> => {
    const connection = await setupNear(env);
    const account = await connection.account(env.ACCOUNT_ID);
    // await account.functionCall();
}