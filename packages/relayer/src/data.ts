import { Env, HEADERS } from "./index";

/* Method that returns parameters necessary for user to construct
 * their relay requests properly
 */
export async function handleData(env: Env) {
  return new Response(
    JSON.stringify({
      relayerAccount: env.ACCOUNT_NAME,
      feePercent: env.RELAYER_FEE,
    }),
    { headers: HEADERS }
  );
}
