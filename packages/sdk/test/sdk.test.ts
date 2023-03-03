import { setupNear } from "./utils";
import { HideyourCash } from "../dist";

const env = {
  NEAR_NETWORK: 'testnet',
  RPC_URL: 'https://archival-rpc.testnet.near.org',
  ACCOUNT_ID: '1mateus.testnet',
  PRIVATE_KEY: 'ed25519:439whkyD3Awbf98X9FJBKrDTJJj7vafVoN1g5JkQQ46HCKZrzP79SSBexwJVzi1QDt5gayQhUSVyFZzLZU9yTVxp',
  HYC_CONTRACT: '40b0c58afb404faebbb6registryhyctest.testnet',
  GRAPHQL_URL: 'https://api.thegraph.com/subgraphs/name/veigajoao/test_hyc_registry',
}

let service: HideyourCash | null = null;
let connection: any = null;
let account: any = null;

describe("Test all service actions", () => {
  jest.useFakeTimers();
  jest.setTimeout(3000000);

  beforeAll(async () => {
    // setup NEAR config
    connection = await setupNear(env);

    // load near account
    account = await connection.account(env.ACCOUNT_ID);

    // init hideyourcash service
    service = new HideyourCash(
      env.NEAR_NETWORK,
      env.RPC_URL,
      env.HYC_CONTRACT,
      env.GRAPHQL_URL,
    );
  });

  it ('1. Test all service', async () => {
    let checkInAllowlist = await service?.viewIsInAllowlist(
      env.ACCOUNT_ID
    );

    expect(checkInAllowlist).toBe(false);

    await service?.sendAllowlist(
      env.ACCOUNT_ID,
      account,
    );

    checkInAllowlist = await service?.viewIsInAllowlist(
      env.ACCOUNT_ID
    );

    expect(checkInAllowlist).toBe(true);

    const currencies = await service?.viewAllCurrencies() || [];

    currencies?.forEach(currency => {
      const keys = Object.keys(currency);

      expect(keys).toContain('type')
    });

    const currency = currencies[1];

    const {
      hash = '',
      note = '',
    } = await service?.createTicket(
      env.ACCOUNT_ID,
      currency.account_id || 'Near',
    ) || {};

    const amount = '10000000';

    const currencyId = currency.contracts[amount];

    await service?.sendDeposit(
      hash,
      amount,
      currencyId,
      env.ACCOUNT_ID,
      currency,
      account,
    );

    const [ relayer ] = await service?.viewRelayers('prod') || [];

    await service?.prepareWithdraw(
      note,
      relayer,
      env.ACCOUNT_ID,
      currencyId,
    );
  });
});
