import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Account, Near } from "near-api-js";
import {
  ChangeFunctionCallOptions,
  ViewFunctionCallOptions,
} from "near-api-js/lib/account";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { PublicKey } from "near-api-js/lib/utils";
import { Configuration } from "src/config/configuration";

import { CONNECTION_PROVIDER_KEY } from "./constants";

@Injectable()
export class NearService {
  private account: Promise<Account>;

  constructor(
    @Inject(CONNECTION_PROVIDER_KEY)
    private connection: Near,
    configService: ConfigService<Configuration>
  ) {
    const nearConfig = configService.get("near", { infer: true });

    this.account = this.connection.account(nearConfig.account.id);
  }

  async callContractChangeFunction<T>(
    options: ChangeFunctionCallOptions
  ): Promise<FinalExecutionOutcome> {
    const account = await this.account;
    const outcome = await account.functionCall(options);

    return outcome;
  }

  async callContractViewFunction<T>(
    options: ViewFunctionCallOptions
  ): Promise<T> {
    const account = await this.account;
    const result: T = await account.viewFunctionV2(options);

    return result;
  }
}
