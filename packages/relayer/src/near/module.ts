import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { connectionProvider } from "./connection.provider";
import { NearService } from "./service";

@Module({
  imports: [ConfigModule],
  providers: [NearService, connectionProvider],
  exports: [NearService],
})
export class NearModule {}
