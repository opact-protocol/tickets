"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testnetSetup = void 0;
const near_api_js_1 = require("near-api-js");
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("./utils");
const { UrlAccountCreator } = near_api_js_1.accountCreator;
function testnetSetup() {
    return __awaiter(this, void 0, void 0, function* () {
        // set connection
        const CREDENTIALS_DIR = ".near-credentials";
        const keyStore = new near_api_js_1.keyStores.UnencryptedFileSystemKeyStore(CREDENTIALS_DIR);
        const config = {
            networkId: "testnet",
            nodeUrl: "https://rpc.testnet.near.org",
            walletUrl: "https://wallet.testnet.near.org",
            helperUrl: "https://helper.testnet.near.org",
            explorerUrl: "https://explorer.testnet.near.org",
            deps: { keyStore },
        };
        const near = yield (0, near_api_js_1.connect)(config);
        const accountCreator = new UrlAccountCreator(near.connection, config.helperUrl);
        let last_block = yield near.connection.provider.block({ finality: "final" });
        let last_block_height = last_block.header.height;
        // save accounts
        const random_prefix = crypto_1.default.randomBytes(10).toString("hex");
        const registryAccount = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "registryhyctest.testnet");
        const nearInstanceAccount10 = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "nearhyctest10.testnet");
        const nearInstanceAccount100 = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "nearhyctest100.testnet");
        const nearInstanceAccount1000 = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "nearhyctest1000.testnet");
        const tokenInstanceAccount10 = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "tokenhyctest10.testnet");
        const tokenInstanceAccount100 = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "tokenhyctest100.testnet");
        const tokenInstanceAccount1000 = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "tokenhyctest1000.testnet");
        const tokenContractAccount = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "tokenaccount.testnet");
        const owner = yield (0, utils_1.createAccount)(accountCreator, config, near, random_prefix + "owner.testnet");
        // deploy token
        yield (0, utils_1.deployToken)(tokenContractAccount, owner);
        // deploy registry
        yield (0, utils_1.deployRegistry)(registryAccount, owner);
        // deploy instances
        yield (0, utils_1.deployInstance)(nearInstanceAccount10, owner, registryAccount, { type: "Near" }, "10" + utils_1.NEAR_DECIMALS);
        yield (0, utils_1.deployInstance)(nearInstanceAccount100, owner, registryAccount, { type: "Near" }, "100" + utils_1.NEAR_DECIMALS);
        yield (0, utils_1.deployInstance)(nearInstanceAccount1000, owner, registryAccount, { type: "Near" }, "1000" + utils_1.NEAR_DECIMALS);
        yield (0, utils_1.deployInstance)(tokenInstanceAccount10, owner, registryAccount, { type: "Nep141", account_id: tokenContractAccount.accountId }, "10" + utils_1.FT_DECIMALS);
        yield (0, utils_1.deployInstance)(tokenInstanceAccount100, owner, registryAccount, { type: "Nep141", account_id: tokenContractAccount.accountId }, "100" + utils_1.FT_DECIMALS);
        yield (0, utils_1.deployInstance)(tokenInstanceAccount1000, owner, registryAccount, { type: "Nep141", account_id: tokenContractAccount.accountId }, "1000" + utils_1.FT_DECIMALS);
        yield (0, utils_1.addEntry)(registryAccount, owner, { type: "Near" }, "10" + utils_1.NEAR_DECIMALS, nearInstanceAccount10);
        yield (0, utils_1.addEntry)(registryAccount, owner, { type: "Near" }, "100" + utils_1.NEAR_DECIMALS, nearInstanceAccount100);
        yield (0, utils_1.addEntry)(registryAccount, owner, { type: "Near" }, "1000" + utils_1.NEAR_DECIMALS, nearInstanceAccount1000);
        yield (0, utils_1.addEntry)(registryAccount, owner, { type: "Nep141", account_id: tokenContractAccount.accountId }, "10" + utils_1.FT_DECIMALS, tokenInstanceAccount10);
        yield (0, utils_1.addEntry)(registryAccount, owner, { type: "Nep141", account_id: tokenContractAccount.accountId }, "100" + utils_1.FT_DECIMALS, tokenInstanceAccount100);
        yield (0, utils_1.addEntry)(registryAccount, owner, { type: "Nep141", account_id: tokenContractAccount.accountId }, "1000" + utils_1.FT_DECIMALS, tokenInstanceAccount1000);
        console.log("block of creation:", last_block_height);
        console.log("registry id:", registryAccount.accountId);
    });
}
exports.testnetSetup = testnetSetup;
