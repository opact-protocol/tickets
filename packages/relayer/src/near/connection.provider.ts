import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { connect, KeyPair, Near } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { Configuration } from "src/config/configuration";
import { CONNECTION_PROVIDER_KEY } from "./constants";

export const connectionProvider: Provider = {
  provide: CONNECTION_PROVIDER_KEY,
  useFactory: async (
    configService: ConfigService<Configuration>
  ): Promise<Near> => {
    const nearConfig = configService.get("near", { infer: true });

    const keyStore = new InMemoryKeyStore();
    const keyPair = KeyPair.fromString(nearConfig.account.keyPair);
    keyStore.setKey(
      nearConfig.connection.networkId,
      nearConfig.account.id,
      keyPair
    );

    return await connect({
      ...nearConfig.connection,
      keyStore,
    });
  },
  inject: [ConfigService],
};
