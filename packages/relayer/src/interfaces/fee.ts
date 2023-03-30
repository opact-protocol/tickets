export type CurrencyType =
  | {
      type: "Near";
    }
  | {
      type: "Nep141";
      account_id: string;
    };

export type CalculateFeeBodyResponseType =
  | {
      status: "failure";
      error: string;
    }
  | {
      token: string;
      status: "sucess";
      timestamp: number;
      network_fee: string;
      percentage_fee: string;
      price_token_fee: string;
      valid_fee_for_ms: number;
      human_network_fee: string;
      user_will_receive: string;
      formatted_token_fee: string;
      formatted_user_will_receive: string;
    };

export interface RequestParamsInterface {
  instanceId: string;
  receiverAccountId: string;
}

export interface CalculateFeeRequestInterface extends RouterRequest {
  body: RequestParamsInterface;
}

export interface CalculateFeeResponseInterface {
  status: number;
  body: CalculateFeeBodyResponseType;
}
