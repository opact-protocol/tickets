import { Logger, Post, Body, Response, Controller } from "@nestjs/common";
import * as express from "express";
import { moneyURI } from "./constants";
import { MoneyService } from "./service";
import { ContractWithdrawInterface } from "./configuration";

interface proofDto {
  foo: string;
}

@Controller(moneyURI)
export class MoneyController {
  constructor(private moneyService: MoneyService) {}

  @Post("withdraw")
  async withdraw(
    @Body() payload: ContractWithdrawInterface,
    @Response() res: express.Response
  ) {
    try {
      const viewResult = await this.moneyService.withdraw(payload);

      return res.status(200).send(viewResult).end();
    } catch (e) {
      Logger.log(e);

      return res.status(400).send("Bad Request");
    }
  }
}

export default MoneyController;
