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
} from '@/views';
import { PublicArgsInterface } from '@/interfaces';
import { RelayerBaseRequest } from '@/constants/relayer';

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

  viewCurrencyContracts () {
    return viewCurrencyContracts(
      this.nodeUrl,
      this.contract,
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

  async viewRelayerHash (relayer: any) {
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
      ...RelayerBaseRequest,
      method: 'GET'
    });

    return [await res.json()];
  }
}
