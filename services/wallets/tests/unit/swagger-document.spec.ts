import { describe, expect, it } from "bun:test";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { CreateWalletUseCase } from "../../src/application/use-cases/create-wallet/create-wallet.use-case";
import { GetWalletByPlayerIdUseCase } from "../../src/application/use-cases/get-wallet-by-player-id/get-wallet-by-player-id.use-case";
import { WalletsController } from "../../src/presentation/controllers/wallets.controller";

const noop = { execute: async () => ({}) };

@Module({
  controllers: [WalletsController],
  providers: [
    { provide: CreateWalletUseCase, useValue: noop },
    { provide: GetWalletByPlayerIdUseCase, useValue: noop },
  ],
})
class SwaggerTestModule {}

describe("Wallets OpenAPI document", () => {
  it("generates public REST paths with bearer auth on protected routes", async () => {
    const app = await NestFactory.create(SwaggerTestModule, { logger: false });
    const config = new DocumentBuilder()
      .setTitle("Crash Game — Wallets API")
      .addBearerAuth(undefined, "bearer")
      .build();
    const document = SwaggerModule.createDocument(app, config);

    expect(document.paths["/health"]?.get).toBeDefined();
    expect(document.paths["/"]?.post).toBeDefined();
    expect(document.paths["/me"]?.get).toBeDefined();

    expect(document.paths["/"]?.post?.security).toEqual([{ bearer: [] }]);
    expect(document.paths["/me"]?.get?.security).toEqual([{ bearer: [] }]);
    expect(document.paths["/health"]?.get?.security).toBeUndefined();

    await app.close();
  });
});
