import routes from "virtual:generated-pages-react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import TagManager from "react-gtm-module";
import { HideyourCash } from 'hideyourcash-sdk';
import { useEnv } from "@/hooks/useEnv";
import { useApplication } from "@/store";
import { useWallet } from "@/store/wallet";
import { connect, keyStores, KeyPair } from "near-api-js";

const env = {
  NEAR_NETWORK: 'testnet',
  RPC_URL: 'https://archival-rpc.testnet.near.org',
  ACCOUNT_ID: '1mateus.testnet',
  PRIVATE_KEY: 'ed25519:439whkyD3Awbf98X9FJBKrDTJJj7vafVoN1g5JkQQ46HCKZrzP79SSBexwJVzi1QDt5gayQhUSVyFZzLZU9yTVxp',
  HYC_CONTRACT: '40b0c58afb404faebbb6registryhyctest.testnet',
  GRAPHQL_URL: 'https://api.thegraph.com/subgraphs/name/veigajoao/test_hyc_registry',
}

export const setupNear = async ({
  RPC_URL,
  ACCOUNT_ID,
  PRIVATE_KEY,
  NEAR_NETWORK,
}: {
  RPC_URL: string,
  ACCOUNT_ID: string,
  PRIVATE_KEY: string,
  NEAR_NETWORK: string,
}) => {
  const myKeyStore = new keyStores.InMemoryKeyStore();

  const keyPair = KeyPair.fromString(PRIVATE_KEY);

  await myKeyStore.setKey(NEAR_NETWORK, ACCOUNT_ID, keyPair);

  const connectionConfig = {
    nodeUrl: RPC_URL,
    networkId: NEAR_NETWORK,
  };

  return connect({ ...connectionConfig, keyStore: myKeyStore });
};


const Pages = () => {
  return useRoutes(routes);
};

export const App = () => {
  (async () => {
    // setup NEAR config
    const connection = await setupNear(env);

    // load near account
    const account = await connection.account(env.ACCOUNT_ID);

    const service = new HideyourCash(
      env.NEAR_NETWORK,
      env.RPC_URL,
      env.HYC_CONTRACT,
      env.GRAPHQL_URL,
    );

    const currencies = await service?.viewAllCurrencies() || [];

    const currency = currencies[1];

    // const {
    //   hash = '',
    //   note = '',
    // } = await service?.createTicket(
    //   env.ACCOUNT_ID,
    //   currency.account_id || 'Near',
    // ) || {};

    // console.log('-- hash - note --');
    // console.log(hash);
    // console.log('-- hash - note --');
    // console.log(note);
    // console.log(' ');

    const amount = '10000000';

    const currencyId = currency.contracts[amount];

    // console.log(hash);

    // const deposit = await service?.sendDeposit(
    //   hash,
    //   amount,
    //   currencyId,
    //   env.ACCOUNT_ID,
    //   currency,
    //   account,
    // );

    // console.log('despoit', deposit);

    const [ relayer ] = await service?.viewRelayers('prod') || [];

    await service?.prepareWithdraw(
      '13231883832982618644925804743528651542494859873959944679932064694939244383666-41107413380383935955065417369115956407273520916777520364465903677391648857-187192272639035181799285191615716773332647746359236176530775295135382973267-17881597763896769714078483407050197146887670059963737309885706338952105582421',
      relayer,
      env.ACCOUNT_ID,
      currencyId,
    );
  })();

  return (
    <Router>
      <Pages />
    </Router>
  );
};
