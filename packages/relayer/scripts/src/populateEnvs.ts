import { deploySecrets } from "./secrets";

const {
    NEAR_NETWORK,
    RPC_URL,
    PRIVATE_KEY,
    ACCOUNT_ID,
    RELAYER_FEE,
    RELAYER_URL,
    HYC_CONTRACT,
    BASE_STORAGE_FEE,
    CF_API_TOKEN,
    CF_IDENTIFIER,
    RELAYER_NAME
} = process.env;

if (
    !NEAR_NETWORK ||
    !RPC_URL ||
    !PRIVATE_KEY ||
    !ACCOUNT_ID ||
    !RELAYER_FEE ||
    !RELAYER_URL ||
    !HYC_CONTRACT ||
    !BASE_STORAGE_FEE ||
    !CF_API_TOKEN ||
    !CF_IDENTIFIER ||
    !RELAYER_NAME
) {
    throw new Error("There are missing Envs that need to be set");
}

deploySecrets(CF_API_TOKEN, RELAYER_NAME, CF_IDENTIFIER, [
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
        name: "RELAYER_FEE",
        text: RELAYER_FEE,
        type: 'secret_text',
    },
    {
        name: "RELAYER_URL",
        text: RELAYER_URL,
        type: 'secret_text',
    },
    {
        name: "HYC_CONTRACT",
        text: HYC_CONTRACT,
        type: 'secret_text',
    },
    {
        name: "BASE_STORAGE_FEE",
        text: BASE_STORAGE_FEE,
        type: 'secret_text',
    },
])