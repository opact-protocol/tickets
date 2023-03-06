import { baseConnectionConfig, CREDENTIALS_DIR } from "../constants";
import { connect, keyStores, accountCreator } from "near-api-js";

export const getConnection = async () => {
  const { UrlAccountCreator } = accountCreator;

  const keyStore = new keyStores.UnencryptedFileSystemKeyStore(CREDENTIALS_DIR);

  const config = {
    ...baseConnectionConfig,
    deps: { keyStore },
  };

  const near = await connect(config);

  return {
    near,
    config,
    creator: new UrlAccountCreator(near.connection, config.helperUrl),
  };
};
