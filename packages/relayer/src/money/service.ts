import * as BN from "bn.js";
import { utils } from "near-api-js";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "src/config/configuration";
import { NearService } from "src/near/service";
import { ContractWithdrawInterface } from "./configuration";

@Injectable()
export class MoneyService {
  private contractId: string;

  constructor(
    private nearService: NearService,
    configService: ConfigService<Configuration>
  ) {
    const nearConfig = configService.get("money", { infer: true });

    this.contractId = nearConfig.contractId;
  }

  async withdraw(args: ContractWithdrawInterface): Promise<any> {
    return await this.nearService.callContractChangeFunction({
      contractId: this.contractId,
      methodName: "withdraw",
      args,
      gas: new BN("300000000000000"),
    });
  }
}
