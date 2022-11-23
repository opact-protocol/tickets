import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NearModule } from "src/near/module";
import { MoneyController } from "./controller";
import { MoneyService } from "./service";

@Module({
  imports: [ConfigModule, NearModule],
  controllers: [MoneyController],
  providers: [MoneyService],
  exports: [MoneyService],
})
export class MoneyModule {}
