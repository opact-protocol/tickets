import { useEnv } from '@/hooks/useEnv';
import { TicketStored } from '../hooks/useWithdraw';
import { createProofWorker } from './proof-worker';
import { BuildProof, CalculateRelayerFee, GetTicketInterface, SendAllowlistInterface, SendDepositInterface, TicketIsValid, ValidatedTicket } from './sdk.types';
import { getTicketInTheMerkleTree } from '@/utils/graphql-queries';
import {
  sendWithdraw,
  sendDeposit,
  generateProofInput,
  getCommitmentByTicket,
  getPublicArgs,
  viewWasNullifierSpent,
  getRelayerFee,
  getRandomRelayer,
  createTicket,
  viewIsInAllowlist as isInAllowlist,
  viewAllCurrencies,
  sendAllowlist as allowlist
} from 'hideyourcash-sdk';

// import {
//   getLastDepositsBeforeTheTicketWasCreated,
//   getLastWithdrawBeforeTheTicketWasCreated,
// } from "@/utils/graphql-queries";

// CONTRACTS
export const registry = useEnv('VITE_CONTRACT')

// URLS
export const circuitUrl = './circuit.zkey'
export const verifierUrl = './verifier.wasm'
export const nodeUrl = useEnv('VITE_NEAR_NODE_URL')
export const graphqlUrl = useEnv('VITE_API_GRAPHQL_URL')

// NETWORKS
export const nearNetwork = useEnv('VITE_NEAR_NETWORK')
export const relayerNetwork = useEnv('VITE_RELAYER_NETWORK')

export const sendAllowlist = ({
  accountId,
  connection,
}: SendAllowlistInterface) => allowlist(
  nodeUrl,
  registry,
  accountId,
  connection
)

export const deposit = async ({
  hash,
  amount,
  depositContract,
  accountId,
  currency,
  connection,
}: SendDepositInterface) => {
  console.log(nodeUrl, hash, amount, depositContract, accountId, currency, connection)
  return await sendDeposit(
    nodeUrl,
    hash,
    amount,
    depositContract,
    accountId,
    currency,
    connection,
  )
}

export const getTicket = async ({
  accountId,
  instanceId,
}: GetTicketInterface): Promise<any> => {
  return await createTicket(nodeUrl, registry, accountId, instanceId)
}

export const send = async ({
  token,
  relayer,
  publicArgs,
}: any): Promise<any> => {
  return await sendWithdraw(relayer, {
    token,
    publicArgs,
  });
}

export const ticketIsValid = async ({
  note
}: TicketIsValid): Promise<ValidatedTicket> => {
  if (note.split("-").length < 4) {
    return {
      isValid: false,
      message: 'Ticket invalid.'
    };
  }

  const commitment = await getCommitmentByTicket(note);

  const ticketStored: TicketStored = await getTicketInTheMerkleTree(
    commitment!
  );

  if (!ticketStored) {
    return {
      isValid: false,
      message: 'This ticket has not been deposited yet.'
    };
  }

  const wasNullifierSpent = await viewWasNullifierSpent(
    nodeUrl,
    note
  );

  if (wasNullifierSpent) {
    return {
      isValid: false,
      message: 'This ticket has already been used.'
    };
  }

  return {
    isValid: true,
    ticket: ticketStored,
    message: 'Ticket is valid'
  }
}

export const buildProof = async ({
  fee,
  note,
  ticket,
  relayer,
  receiver,
  callbackProgress,
}: BuildProof): Promise<any> => {
  const { worker, handlers } = createProofWorker()

  try {
    const input = await generateProofInput({
      note,
      relayer,
      registry,
      graphqlUrl,
      nodeUrl: nodeUrl,
      recipient: receiver,
      fee: fee.price_token_fee,
      contract: ticket?.contract,
    });

    const { payload } = await handlers.buildProof({
      circuitUrl,
      verifierUrl,
      payload: input,
      callbackProgress,
    }) as any

    return getPublicArgs(
      payload.proof,
      relayer,
      payload.publicSignals,
      receiver,
    )

  } catch (e) {
    console.warn(e)

    if (e instanceof Error) {
      throw new Error(e.message);
    }
  } finally {
    worker.terminate()

    console.log('terminate worker');
  }
}

export const calculateRelayerFee = async ({
  relayer,
  address,
  contract
}: CalculateRelayerFee): Promise<any> => {
  return await getRelayerFee(
    relayer,
    address,
    contract
  )
}

export const randomRelayer = async () => {
  const [ relayer ] = await getRandomRelayer({ network: relayerNetwork})

  return relayer
}


export const viewIsInAllowlist = async ({
  accountId
}: { accountId: string}) => {
  if (!accountId) {
    return
  }

  return await isInAllowlist(
    nodeUrl,
    registry,
    accountId
  );
}

export const getAllCurrencies = async () => {
  const currencies = await viewAllCurrencies(
    nodeUrl,
    registry,
  );

  return currencies.map((token) => ({
    ...token,
    ...(token.type === "Near" && { icon: "/near-icon.svg" }),
  }))
}
