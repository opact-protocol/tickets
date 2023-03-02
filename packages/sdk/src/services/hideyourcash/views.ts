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
} from '../../views';
import fetch from 'node-fetch';
import type { Currency, PublicArgsInterface, RelayerDataInterface } from '../../interfaces';
import { relayerBaseRequest } from '../../constants/relayer';

const baseRelayers = {
  test: 'https://dev-relayer.hideyourcash.workers.dev',
  prod: 'https://prod-relayer.hideyourcash.workers.dev',
}

export class Views {
  readonly contract: string;
  readonly nodeUrl: string;

  constructor (
    nodeUrl: string,
    contract: string,
  ) {
    this.nodeUrl = nodeUrl;
    this.contract = contract;
  }

  viewIsInAllowlist (accountId: string) {
    return viewIsInAllowlist(
      this.nodeUrl,
      this.contract,
      accountId,
    );
  }

  viewAccountHash (accountId: string) {
    return viewAccountHash(
      this.nodeUrl,
      this.contract,
      accountId,
    );
  }

  viewAllCurrencies () {
    return viewAllCurrencies(
      this.nodeUrl,
      this.contract,
    );
  }

  viewCurrencyContracts (currency: Currency) {
    return viewCurrencyContracts(
      this.nodeUrl,
      this.contract,
      currency,
    );
  }

  viewIsContractAllowed (contract: string) {
    return viewIsContractAllowed(
      this.nodeUrl,
      this.contract,
      contract,
    );
  }

  viewIsAllowlistRootValid (root: string) {
    return viewIsAllowlistRootValid(
      this.nodeUrl,
      this.contract,
      root,
    );
  }

  async viewRelayerHash (relayer: RelayerDataInterface) {
    return viewRelayerHash(
      this.nodeUrl,
      this.contract,
      relayer,
    );
  }

  async viewIsWithdrawValid (payload: PublicArgsInterface) {
    return viewIsWithdrawValid(
      this.nodeUrl,
      this.contract,
      payload,
    );
  }

  async viewWasNullifierSpent (nullifier: string) {
    return viewWasNullifierSpent(
      this.nodeUrl,
      this.contract,
      nullifier,
    );
  }

  async viewRelayers (network: 'test' | 'prod' = 'test') {
    const res = await fetch(baseRelayers[network] + '/data', {
      ...relayerBaseRequest,
      method: 'GET'
    });

    return [await res.json()];
  }
}
