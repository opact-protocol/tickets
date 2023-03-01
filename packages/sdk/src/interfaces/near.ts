export interface FungibleTokenMetadataInterface {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  reference: string | null;
  reference_hash: string | null;
  decimals: number;
}

export type NFTContractMetadataInterface = {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  base_uri: string | null;
  reference: string | null;
  reference_hash: string | null;
};

export type TokenMetadataInterface = {
  title: string | null;
  description: string | null;
  media: string | null;
  media_hash: string | null;
  copies: number | null;
  issued_at: number | null;
  expires_at: number | null;
  starts_at: number | null;
  updated_at: number | null;
  extra: string | null;
  reference: string | null;
  reference_hash: string | null;
};

export type Token = {
  token_id: string,
  owner_id: string,
  metadata: TokenMetadataInterface,
};

export type Currency =
  | {
      type: "Near";
    }
  | {
      type: "Nep141";
      account_id: string;
    };
