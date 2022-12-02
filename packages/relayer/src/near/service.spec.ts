import { createMock, DeepMocked } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { Account, Near } from "near-api-js";
import { KeyPairEd25519 } from "near-api-js/lib/utils";
import { configServicePartialMock } from "src/config/mock.test";
import { NearConfiguration } from "./configuration";
import { CONNECTION_PROVIDER_KEY } from "./constants";
import { NearService } from "./service";

describe("NearService", () => {
  let module: TestingModule;
  let nearService: NearService;

  const keyPair = KeyPairEd25519.fromRandom();
  const nearConfig: Partial<NearConfiguration> = {
    receiverId: "abacaba.near",
    account: {
      id: "hackadu.near",
      keyPair: "",
    },
  };

  beforeEach(async () => {
    jest.restoreAllMocks();

    module = await Test.createTestingModule({
      providers: [
        NearService,
        configServicePartialMock("near", nearConfig),
        {
          provide: CONNECTION_PROVIDER_KEY,
          useValue: createMock<Near>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    nearService = module.get(NearService);
  });

  describe("validateAccessKey", () => {
    it("should validate full access key", async () => {
      // Arrange
      const connectionMock: DeepMocked<Near> = module.get(
        CONNECTION_PROVIDER_KEY
      );
      const accountMock = createMock<Account>();

      connectionMock.account.mockResolvedValueOnce(accountMock);

      const keyStub = {
        public_key: keyPair.getPublicKey().toString(),
        access_key: { permission: "FullAccess" },
      };
      accountMock.getAccessKeys.mockResolvedValueOnce([keyStub as any]);

      // Act
      const isKeyValid = await nearService.validateAccessKey(
        "hackadu.near",
        keyPair.getPublicKey()
      );

      // Assert
      expect(isKeyValid).toBe(true);
    });

    it("should validate function call permission key with correct receiver", async () => {
      // Arrange
      const connectionMock: DeepMocked<Near> = module.get(
        CONNECTION_PROVIDER_KEY
      );
      const accountMock = createMock<Account>();

      connectionMock.account.mockResolvedValueOnce(accountMock);

      const keyStub = {
        public_key: keyPair.getPublicKey().toString(),
        access_key: {
          permission: { FunctionCall: { receiver_id: nearConfig.receiverId } },
        },
      };
      accountMock.getAccessKeys.mockResolvedValueOnce([keyStub as any]);

      // Act
      const isKeyValid = await nearService.validateAccessKey(
        "hackadu.near",
        keyPair.getPublicKey()
      );

      // Assert
      expect(isKeyValid).toBe(true);
    });

    it("should invalidate function call permission key with incorrect receiver", async () => {
      // Arrange
      const connectionMock: DeepMocked<Near> = module.get(
        CONNECTION_PROVIDER_KEY
      );
      const accountMock = createMock<Account>();

      connectionMock.account.mockResolvedValueOnce(accountMock);

      const keyStub = {
        public_key: keyPair.getPublicKey().toString(),
        access_key: {
          permission: { FunctionCall: { receiver_id: "whatever" } },
        },
      };
      accountMock.getAccessKeys.mockResolvedValueOnce([keyStub as any]);

      // Act
      const isKeyValid = await nearService.validateAccessKey(
        "hackadu.near",
        keyPair.getPublicKey()
      );

      // Assert
      expect(isKeyValid).toBe(false);
    });
  });
});
