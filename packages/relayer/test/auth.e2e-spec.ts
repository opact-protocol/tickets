import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { NearAccount, Worker } from "near-workspaces";
import { AppModule } from "src/app.module";
import { AuthConfiguration } from "src/auth/configuration";
import { AuthMessage } from "src/auth/service";
import { Configuration } from "src/config/configuration";
import { configServiceMock } from "src/config/mock.test";

type Contracts = {
  nft: NearAccount;
};

type Accounts = {
  owner: NearAccount;
  user: NearAccount;

  contracts: Contracts;
};

describe("Auth", () => {
  jest.setTimeout(25000);

  let module: TestingModule;
  let app: INestApplication;
  let baseUrl: string;

  let worker: Worker;
  let accounts: Accounts;
  let contracts: Contracts;

  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  async function nestSetup(config: Pick<Configuration, "near" | "nft">) {
    const authConfig: AuthConfiguration = {
      jwt: {
        secret: "abacaba",
        validForS: 20,
      },
      messageValidForMs: 60000,
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(
        configServiceMock({
          auth: authConfig,
          near: config.near,
          nft: config.nft,
        })
      )
      .compile();

    app = module.createNestApplication();
    await app.init();
    await app.listen(process.env.PORT ?? 65432); // TODO: dinamically assign ports to allow test concurrency
    baseUrl = await app.getUrl();
  }

  async function nearSetup(): Promise<Pick<Configuration, "near" | "nft">> {
    worker = await Worker.init();

    contracts = {
      nft: await worker.rootAccount.createSubAccount("nft-contract"),
    };

    accounts = {
      owner: await worker.rootAccount.createSubAccount("owner"),
      user: await worker.rootAccount.createSubAccount("hackadu"),

      contracts,
    };

    await contracts.nft.deploy("./wasm/nft_contract.wasm");
    await worker.rootAccount.call(contracts.nft.accountId, "new", {
      owner_id: accounts.owner.accountId,
      metadata: {
        spec: "nft-1.0.0",
        name: "Testers",
        symbol: "TEST",
        icon: null,
        base_uri: "https://imgur.com/gallery/OBB7tLg",
        reference: null,
        reference_hash: null,
      },
    });

    const keyPair = (await contracts.nft.getKey()).toString();

    return {
      near: {
        receiverId: contracts.nft.accountId,
        account: {
          id: contracts.nft.accountId,
          keyPair,
        },
        connection: {
          networkId: "sandbox",
          nodeUrl: worker.provider.connection.url,
        },
      },
      nft: {
        contractAccountId: contracts.nft.accountId,
      },
    };
  }

  beforeEach(async () => {
    jest.restoreAllMocks();

    const nearConfig = await nearSetup();
    await nestSetup(nearConfig);
  });

  afterEach(async () => {
    await worker.tearDown();
    await app.close();
  });

  describe("authentication & authorization flow", () => {
    it("should authenticate valid credentials with a JWT, and then authorize a NFT owner that provides the JWT", async () => {
      // Arrange
      const keyPair = await accounts.user.getKey();
      await accounts.user.updateAccessKey(keyPair, {
        permission: "FullAccess",
        nonce: 0,
      });

      const { accountId } = accounts.user;
      const authMessage: AuthMessage = { timestampMs: new Date().valueOf() };
      const message = new TextEncoder().encode(JSON.stringify(authMessage));
      const { signature, publicKey } = keyPair.sign(message);

      const loginUrl = new URL("/auth/login", baseUrl);
      const reqBody = JSON.stringify({
        accountId,
        signedMessage: {
          message: Array.from(message),
          signature: Array.from(signature),
          publicKey: publicKey.toString(),
        },
      });

      // Act
      const loginResponse = await fetch(loginUrl, {
        method: "POST",
        headers,
        body: reqBody,
      });
      const loginBody = await loginResponse.json();

      // Assert
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.headers.get("content-type")).toMatch(/json/);
      expect(loginBody.success).toBe(true);

      // Arrange
      const { jwt } = loginBody;
      const authenticatedHeaders = new Headers(headers);
      authenticatedHeaders.append("Authorization", `Bearer ${jwt}`);

      const mintResult = await worker.rootAccount.call(
        contracts.nft.accountId,
        "nft_mint",
        { receiver_id: accountId },
        { gas: "300000000000000", attachedDeposit: "6500000000000000000000" }
      );
      const tokenId = mintResult["token_id"];
      const nftUrl = new URL(
        `/nft/verify/${encodeURIComponent(tokenId)}`,
        baseUrl
      );

      // Act
      const nftResponse = await fetch(nftUrl, {
        method: "GET",
        headers: authenticatedHeaders,
      });

      // Assert
      expect(nftResponse.status).toBe(200);
    });
  });
});
