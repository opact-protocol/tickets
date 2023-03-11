import {
  viewAccountHash,
  viewRelayerHash,
  viewIsInAllowlist,
  viewAllCurrencies,
  viewCurrencyContracts,
  viewIsContractAllowed,
  viewIsWithdrawValid,
  viewWasNullifierSpent,
  viewIsAllowlistRootValid,
} from "../../views";
import axios from "axios";
import type {
  Currency,
  PublicArgsInterface,
  RelayerDataInterface,
} from "../../interfaces";

const baseRelayers = {
  /**
   * TODO: fix dev relayer with ENV
   */
  test: "https://prod-relayer.mateus4loading.workers.dev",

  prod: "https://prod-relayer.hideyourcash.workers.dev",
  local: "http://127.0.0.1:8787",
};

export class Views {
  readonly contract: string;
  readonly nodeUrl: string;

  constructor(nodeUrl: string, contract: string) {
    this.nodeUrl = nodeUrl;
    this.contract = contract;
  }

  viewIsInAllowlist(accountId: string) {
    return viewIsInAllowlist(this.nodeUrl, this.contract, accountId);
  }

  viewAccountHash(accountId: string) {
    return viewAccountHash(this.nodeUrl, this.contract, accountId);
  }

  viewAllCurrencies() {
    return viewAllCurrencies(this.nodeUrl, this.contract);
  }

  viewCurrencyContracts(currency: Currency) {
    return viewCurrencyContracts(this.nodeUrl, this.contract, currency);
  }

  viewIsContractAllowed(contract: string) {
    return viewIsContractAllowed(this.nodeUrl, this.contract, contract);
  }

  viewIsAllowlistRootValid(root: string) {
    return viewIsAllowlistRootValid(this.nodeUrl, this.contract, root);
  }

  async viewRelayerHash(relayer: RelayerDataInterface) {
    return viewRelayerHash(this.nodeUrl, this.contract, relayer);
  }

  async viewIsWithdrawValid(payload: PublicArgsInterface, contract: string) {
    return viewIsWithdrawValid(this.nodeUrl, this.contract, contract, payload);
  }

  async viewWasNullifierSpent(nullifier: string) {
    return viewWasNullifierSpent(this.nodeUrl, this.contract, nullifier);
  }

  async getRandomRelayer(
    network: "test" | "prod" | "local" = "test"
  ): Promise<RelayerDataInterface[]> {
    const relayerService = axios.create({
      baseURL: baseRelayers[network],
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    const { data } = await relayerService.get("/data");

    return [
      {
        url: baseRelayers[network],
        account: data.data.relayerAccount,
        feePercent: data.data.feePercent,
      },
    ];
  }
}
