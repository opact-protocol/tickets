import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configuration } from "./config/configuration";
import { MoneyModule } from "./money/module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MoneyModule,
  ],
})
export class AppModule {}
