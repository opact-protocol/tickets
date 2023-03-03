import { setupNear } from "./utils";
import { HideyourCash } from "../dist";
import env from '../temp/env.json';

let account: any = null;
let connection: any = null;
let service: HideyourCash | null = null;

const successStatus = 200;

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

  it ('1. Test service flow', async () => {
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
      currency.account_id || 'near',
    ) || {};

    const amount = '10000000';

    const currencyId = currency.contracts[amount];

    const contractIsAllowed = await service?.viewIsContractAllowed(
      currencyId,
    );

    expect(contractIsAllowed).toBe(true);

    await service?.sendDeposit(
      hash,
      amount,
      currencyId,
      env.ACCOUNT_ID,
      currency,
      account,
    );

    const [ relayer ] = await service?.viewRelayers('test') || [];

    const publicArgs = await service?.prepareWithdraw(
      note,
      relayer,
      env.ACCOUNT_ID,
      currencyId,
    );

    const withdrawIsValid = await service?.viewIsWithdrawValid(
      publicArgs!,
    );

    expect(withdrawIsValid).toBe(true);

    const res = await service?.sendWithdraw(
      relayer,
      publicArgs!,
    );

    expect(res?.data).toBe(successStatus);
  });
});
