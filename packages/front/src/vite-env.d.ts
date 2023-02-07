/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT: string;
  readonly VITE_NEAR_NETWORK: string;
  readonly VITE_NEAR_NODE_URL: string;
  readonly VITE_API_GRAPHQL_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly envPrefix: "VITE_";
}
