import type { Env } from "../types/env";
import type { QueuedData } from "../types/pagination";
import { setupNear, viewFunction, attachedGas, denylistDeposit } from "../utils";

const riskMap: any = {
  "Scam": 5,
  "Theft": 5,
  "Sanctions": 5,
  "ChildAbuse": 5,
  "Ransomware": 5,
  "Counterfeit": 5,
  "DarknetService": 5,
  "TerroristFinancing": 5,
  "IllicitOrganization": 5,
};

/** fetchRiskParams
 * This function must perform a view call to contract to fetch
 * there is currently no such view call in the contract. Mock
 * @param category The risk category
 * @returns Returns the max risk accepted by the contract
 */
const fetchRiskParams = async (category: string, env: Env): Promise<number> => {
  const riskMap = await viewFunction(
    env.RPC_URL,
    env.HYC_CONTRACT,
    'view_risk_params',
  );

  return riskMap[category];
}

/** sendBanTransaction
 * This function must sign and send a denylist transaction to the contract
 * @param payload The queue payload
 * @param env The env object
 * @returns void
 */
const sendBanTransaction = async (payload: QueuedData, env: Env): Promise<void> => {
  const connection = await setupNear(env);

  const account = await connection.account(env.ACCOUNT_ID);

  await account.functionCall({
    contractId: env.HYC_CONTRACT,
    methodName: "denylist",
    args: {
      account_id: payload.account,
    },
    gas: attachedGas,
    attachedDeposit: denylistDeposit,
  });
}

/** consumer
 * This role is responsible for analyzing the risk and, if necessary, submitting the account to the DenyList
 * @param payload The queue payload
 * @param env The env object
 * @returns void
 */
export const consumer = async (payload: QueuedData, env: Env) => {
  console.info(`Start evaluate the payload:`, payload);

  const inAllowlist = await viewFunction(
    env.RPC_URL,
    env.HYC_CONTRACT,
    'view_is_in_allowlist',
    {
      account_id: payload.account,
    }
  );

  if (!inAllowlist) {
    console.info(`The account ${payload.account} is not in Allowlist`);

    return
  }

  const maxRiskScore = await fetchRiskParams(payload.category, env);

  if (Number(payload.risk) <= maxRiskScore) {
    console.info(`The ${payload.account} account is not over the max risk`);

    return
  }

  console.info(`Send the account: ${payload.account} to denylist`);

  try {
    await sendBanTransaction(payload, env);

    console.info(`The ${payload.account} account has been banned`);
  } catch (e) {
    console.warn(`Error to send the account: ${payload.account} to denylist`);
    console.warn(e);
  }
}
