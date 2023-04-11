import { deploySecrets } from "./secrets";

const {
    NEAR_NETWORK,
    RPC_URL,
    PRIVATE_KEY,
    ACCOUNT_ID,
    HYC_CONTRACT,
    CF_API_TOKEN,
    CF_IDENTIFIER,
    GRAPHQL_URL,
} = process.env;

if (
    !NEAR_NETWORK ||
    !RPC_URL ||
    !PRIVATE_KEY ||
    !ACCOUNT_ID ||
    !GRAPHQL_URL ||
    !HYC_CONTRACT ||
    !CF_API_TOKEN ||
    !CF_IDENTIFIER
) {
    throw new Error("There are missing Envs that need to be set");
}

console.log(`Deploy secrets for script: denylist bot`);

deploySecrets(CF_API_TOKEN, CF_IDENTIFIER, [
    {
        name: "NEAR_NETWORK",
        text: NEAR_NETWORK,
        type: 'secret_text',
    },
    {
        name: "RPC_URL",
        text: RPC_URL,
        type: 'secret_text',
    },
    {
        name: "PRIVATE_KEY",
        text: PRIVATE_KEY,
        type: 'secret_text',
    },
    {
        name: "ACCOUNT_ID",
        text: ACCOUNT_ID,
        type: 'secret_text',
    },
    {
        name: "GRAPHQL_URL",
        text: GRAPHQL_URL,
        type: 'secret_text',
    },
    {
        name: "HYC_CONTRACT",
        text: HYC_CONTRACT,
        type: 'secret_text',
    },
]).then(res => {
  console.log('Deploy secrets res: ', res);
});
