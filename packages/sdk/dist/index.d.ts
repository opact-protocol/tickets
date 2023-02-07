import { WalletSelector } from '@near-wallet-selector/core';
import * as axios from 'axios';
import MerkleTree from 'fixed-merkle-tree';
import BN from 'bn.js';
import Big from 'big.js';

declare const viewWasNullifierSpent: (nodeUrl: string, ticket: string) => Promise<any>;

declare const viewIsInAllowlist: (rpcUrl: string, contract: string, accountId: string) => Promise<any>;
declare const viewAccountHash: (rpcUrl: string, contract: string, accountId: string) => Promise<any>;
declare const viewAccountBalance: (rpcUrl: string, contract: string, accountId: string) => Promise<any>;

interface FungibleTokenMetadataInterface {
    spec: string;
    name: string;
    symbol: string;
    icon: string | null;
    reference: string | null;
    reference_hash: string | null;
    decimals: number;
}
type NFTContractMetadataInterface = {
    spec: string;
    name: string;
    symbol: string;
    icon: string | null;
    base_uri: string | null;
    reference: string | null;
    reference_hash: string | null;
};
type TokenMetadataInterface = {
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
type Token = {
    token_id: string;
    owner_id: string;
    metadata: TokenMetadataInterface;
};
type ConnectionType = WalletSelector | any;

interface RelayerDataInterface {
    url: string;
    account: string;
    feePercent: string;
}

type CurrencyContract = {
    [key: string]: string;
};
interface Currency {
    type: "Near" | "Nep141";
    account_id?: string;
}
interface ViewCurrenciesResponseInterface extends Currency {
    contracts: CurrencyContract;
    metadata: FungibleTokenMetadataInterface;
}

interface MerkleTreeStorageInterface {
    __typename: string;
    id: string;
    contract: string;
    index: string;
    signer: string;
    value: string;
    counter: string;
}
interface MerkleTreeCacheInterface {
    lastIndex: number;
    branches: MerkleTreeStorageInterface[];
}

interface PublicArgsInterface {
    root: string;
    nullifier_hash: string;
    recipient: string;
    relayer: any;
    fee: string;
    refund: string;
    allowlist_root: string;
    a: any;
    b: any;
    c: any;
    z: any;
    t_1: any;
    t_2: any;
    t_3: any;
    eval_a: string;
    eval_b: string;
    eval_c: string;
    eval_s1: string;
    eval_s2: string;
    eval_zw: string;
    eval_r: string;
    wxi: any;
    wxi_w: any;
}
interface WithdrawInputInterface {
    fee: string;
    root: string;
    refund: string;
    secret: string;
    relayer: string;
    nullifier: string;
    recipient: string;
    pathIndices: string;
    pathElements: string;
    allowlistRoot: string;
    nullifierHash: string;
    originDepositor: string;
    allowlistPathIndices: string;
    allowlistPathElements: string;
}
interface ParseNoteInterface {
    secret: string;
    contract: string;
    nullifier: string;
    account_hash: string;
}
interface Logger {
    debug(message: string): void;
}

declare const viewRelayerHash: (rpcUrl: string, contract: string, relayer: RelayerDataInterface) => Promise<any>;

declare const viewAllCurrencies: (rpcUrl: string, contract: string) => Promise<ViewCurrenciesResponseInterface[]>;
declare const viewCurrencyContracts: (rpcUrl: string, contract: string, currency: Currency) => Promise<any>;
declare const viewIsContractAllowed: (rpcUrl: string, contract: string, accountId: string) => Promise<any>;
declare const viewIsAllowlistRootValid: (rpcUrl: string, contract: string, root: string) => Promise<any>;

declare const viewIsWithdrawValid: (rpcUrl: string, contract: string, currencyContract: string, payload: PublicArgsInterface) => Promise<boolean>;

declare const createTicket: (nodeRpcUrl: string, contract: string, accountId: string, currencyId: string) => Promise<{
    note: string;
    hash: string;
}>;
declare const sendDeposit: (nodeUrl: string, hash: string, amount: string, depositContract: string, accountId: string, currency: Currency, connection: ConnectionType) => Promise<any>;
declare const getTokenStorage: (token: string, contract: string, nodeRpcUrl: string) => Promise<any>;

declare const getRelayerFee: (relayer: RelayerDataInterface, accountId: string, instanceId: string) => Promise<axios.AxiosResponse<any, any>>;
declare const sendWithdraw: (relayer: RelayerDataInterface, payload: {
    publicArgs: PublicArgsInterface;
    token: string;
}) => Promise<axios.AxiosResponse<any, any>>;
declare const sendContractWithdraw: (nodeUrl: string, contract: string, signerId: string, receiverId: string, publicArgs: PublicArgsInterface, connection: ConnectionType) => Promise<any>;
declare const checkWithdrawStorages: (nodeUrl: string, contract: string, signerId: string, receiverId: string, relayerId?: string) => Promise<any[]>;

declare const getUTCDate: (timestamp?: number) => Date;

interface Transaction {
    signerId: string;
    receiverId: string;
    actions: Action[];
}
interface Action {
    type: string;
    params: Params;
}
interface Params {
    methodName: string;
    args: any;
    gas: string;
    deposit: string;
}
declare const getTransaction: (signerId: string, receiverId: string, method: string, args: object, amount?: string | undefined, skipParser?: boolean) => Transaction;
declare const viewFunction: (nodeUrl: string, contractId: string, methodName: string, args?: any) => Promise<any>;
declare const sendJsonRpc: (nodeUrl: string, method: string, params: object) => Promise<axios.AxiosResponse<any, any>>;
declare const getAmount: (amount: string | undefined, skip?: boolean) => string;
/**
 * Convert human readable NEAR amount to internal indivisible units.
 * Effectively this multiplies given amount.
 *
 * @param rawAmount decimal string (potentially fractional) denominated in NEAR.
 * @returns The parsed yoctoⓃ amount or null if no amount was passed in
 */
declare const parseNearAmount: (rawAmount?: string) => string | null;
declare const cleanupRawAmount: (amount: string) => string;
declare const trimLeadingZeroes: (value: string) => string;

declare function leInt2Buff(value: any): BN;
declare function randomBN(nbytes?: number): BN;

declare function getDecimals(decimals: number | undefined): Big;
declare const formatBigNumberWithDecimals: (value: string | number | Big, decimals: Big) => string;

declare const parseNote: (note: string) => ParseNoteInterface;

declare const shortenAddress: (address: string, chars?: number) => string;

declare const sendTransactionsCallback: (connection: ConnectionType, transactions: Transaction[]) => Promise<any>;

declare const sendAllowlist: (nodeUrl: string, contract: string, accountId: string, connection: ConnectionType) => Promise<any>;

declare const createSnarkProof: (payload: WithdrawInputInterface, verifierUrl: string | undefined, circuitUrl: string | undefined, logger: Logger) => Promise<{
    proof: any;
    publicSignals: string[];
}>;
declare const prepareWithdraw: (nodeUrl: string, contract: string, fee: string, note: string, relayer: RelayerDataInterface, recipient: string, logger: Logger, allowlistTree: MerkleTree, commitmentsTree: MerkleTree, verifierUrl?: string, circuitUrl?: string) => Promise<{
    publicArgs: PublicArgsInterface;
}>;
declare const getWithdrawInput: ({ hash }: {
    hash: string;
}, fee: string, recipientHash: string, path: any, pathAL: any, commitment: any, single_hash: any) => Promise<WithdrawInputInterface>;
declare const getPublicArgs: (proof: any, relayer: RelayerDataInterface, publicSignals: string[], receiver: string) => PublicArgsInterface;

declare const prepareMerkleTree: (contract: string, name: string, branchesQuery: any, lastBranchesQuery: any, graphqlUrl: string, cache?: MerkleTreeCacheInterface) => Promise<MerkleTree>;

type IntoBigInt = string | number | bigint | boolean | BN;
declare class MimcSponge {
    sponge: any;
    initialized: boolean;
    initMimc(): Promise<{
        hash: (left: IntoBigInt, right: IntoBigInt) => string;
        singleHash: (single: IntoBigInt) => string;
    }>;
}
declare const mimc: MimcSponge;

declare class MerkleTreeService {
    readonly name: string;
    readonly contract: string;
    readonly graphqlUrl: string;
    readonly branchesQuery: any;
    readonly lastBranchesQuery: any;
    tree: any | undefined;
    constructor(contract: string, name: string, graphqlUrl: string, branchesQuery: any, lastBranchesQuery: any);
    initMerkleTree(cache?: MerkleTreeCacheInterface): Promise<MerkleTree>;
    getBranches(cache?: MerkleTreeCacheInterface): Promise<any[]>;
    getLastBranchIndex(): Promise<number>;
    getMerkleTreeBranchesWithQuery({ query }: any, variables?: any): Promise<any>;
    getMerkleTreeBranchesWithPaginatedQuery({ query }: any, variables?: any): Promise<any[]>;
}

declare class Views {
    readonly contract: string;
    readonly nodeUrl: string;
    constructor(nodeUrl: string, contract: string);
    viewIsInAllowlist(accountId: string): Promise<any>;
    viewAccountHash(accountId: string): Promise<any>;
    viewAllCurrencies(): Promise<ViewCurrenciesResponseInterface[]>;
    viewCurrencyContracts(currency: Currency): Promise<any>;
    viewIsContractAllowed(contract: string): Promise<any>;
    viewIsAllowlistRootValid(root: string): Promise<any>;
    viewRelayerHash(relayer: RelayerDataInterface): Promise<any>;
    viewIsWithdrawValid(payload: PublicArgsInterface, contract: string): Promise<boolean>;
    viewWasNullifierSpent(ticket: string): Promise<any>;
    viewAccountBalance(contract: string, accountId: string): Promise<any>;
    getRandomRelayer(network?: "test" | "prod" | "local"): Promise<RelayerDataInterface[]>;
}

declare class Actions extends Views {
    readonly nodeUrl: string;
    readonly contract: string;
    readonly graphqlUrl?: string;
    readonly verifierUrl?: string;
    readonly circuitUrl?: string;
    constructor(nodeUrl: string, contract: string, graphqlUrl?: string, verifierUrl?: string, circuitUrl?: string);
    sendAllowlist(accountId: string, connection: ConnectionType): Promise<any>;
    createTicket(accountId: string, currencieContract: string): Promise<{
        note: string;
        hash: string;
    }>;
    sendDeposit(hash: string, amount: string, contract: string, accountId: string, currency: Currency, connection: ConnectionType): Promise<any>;
    sendContractWithdraw(contract: string, signerId: string, receiverId: string, publicArgs: PublicArgsInterface, connection: ConnectionType): Promise<any>;
    getRelayerFee(relayer: RelayerDataInterface, accountId: string, instanceId: string): Promise<axios.AxiosResponse<any, any>>;
    sendWithdraw(relayer: RelayerDataInterface, payload: {
        publicArgs: PublicArgsInterface;
        token: string;
    }): Promise<axios.AxiosResponse<any, any>>;
    prepareWithdraw(fee: string, note: string, relayer: RelayerDataInterface, recipient: string, currencyContract: string, logger: Logger, allowlistTreeCache?: MerkleTreeCacheInterface, commitmentsTreeCache?: MerkleTreeCacheInterface): Promise<PublicArgsInterface>;
}

declare class HideyourCash extends Actions {
    readonly network: string;
    readonly nodeUrl: string;
    readonly contract: string;
    readonly graphqlUrl?: string;
    constructor(network: string, nodeUrl: string, contract: string, graphqlUrl?: string, verifierUrl?: string, circuitUrl?: string);
}

export { Action, ConnectionType, Currency, CurrencyContract, FungibleTokenMetadataInterface, HideyourCash, Logger, MerkleTreeCacheInterface, MerkleTreeService, MerkleTreeStorageInterface, MimcSponge, NFTContractMetadataInterface, Params, ParseNoteInterface, PublicArgsInterface, RelayerDataInterface, Token, TokenMetadataInterface, Transaction, ViewCurrenciesResponseInterface, WithdrawInputInterface, checkWithdrawStorages, cleanupRawAmount, createSnarkProof, createTicket, formatBigNumberWithDecimals, getAmount, getDecimals, getPublicArgs, getRelayerFee, getTokenStorage, getTransaction, getUTCDate, getWithdrawInput, leInt2Buff, mimc, parseNearAmount, parseNote, prepareMerkleTree, prepareWithdraw, randomBN, sendAllowlist, sendContractWithdraw, sendDeposit, sendJsonRpc, sendTransactionsCallback, sendWithdraw, shortenAddress, trimLeadingZeroes, viewAccountBalance, viewAccountHash, viewAllCurrencies, viewCurrencyContracts, viewFunction, viewIsAllowlistRootValid, viewIsContractAllowed, viewIsInAllowlist, viewIsWithdrawValid, viewRelayerHash, viewWasNullifierSpent };
