import { describe, expect, it } from "bun:test";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { GetBetByIdUseCase } from "../../src/application/use-cases/get-bet-by-id/get-bet-by-id.use-case";
import { GetCurrentRoundUseCase } from "../../src/application/use-cases/get-current-round/get-current-round.use-case";
import { GetPlayerBetHistoryUseCase } from "../../src/application/use-cases/get-player-bet-history/get-player-bet-history.use-case";
import { GetRoundHistoryUseCase } from "../../src/application/use-cases/get-round-history/get-round-history.use-case";
import { PlaceBetUseCase } from "../../src/application/use-cases/place-bet/place-bet.use-case";
import { VerifyRoundUseCase } from "../../src/application/use-cases/verify-round/verify-round.use-case";
import { CashoutBetUseCase } from "../../src/application/use-cases/cashout-bet/cashout-bet.use-case";
import { BetWebSocketNotifier } from "../../src/infrastructure/websocket/bet-websocket.notifier";
import { GamesController } from "../../src/presentation/controllers/games.controller";

const noop = { execute: async () => ({}) };

@Module({
  controllers: [GamesController],
  providers: [
    { provide: GetCurrentRoundUseCase, useValue: noop },
    { provide: PlaceBetUseCase, useValue: noop },
    { provide: CashoutBetUseCase, useValue: noop },
    { provide: BetWebSocketNotifier, useValue: { notifyCashedOut: async () => undefined } },
    { provide: GetBetByIdUseCase, useValue: noop },
    { provide: GetPlayerBetHistoryUseCase, useValue: noop },
    { provide: VerifyRoundUseCase, useValue: noop },
    { provide: GetRoundHistoryUseCase, useValue: noop },
  ],
})
class SwaggerTestModule {}

describe("Games OpenAPI document", () => {
  it("generates public REST paths with bearer auth and excludes internal routes", async () => {
    const app = await NestFactory.create(SwaggerTestModule, { logger: false });
    const config = new DocumentBuilder()
      .setTitle("Crash Game — Games API")
      .addBearerAuth(undefined, "bearer")
      .build();
    const document = SwaggerModule.createDocument(app, config);

    expect(document.paths["/health"]?.get).toBeDefined();
    expect(document.paths["/rounds/current"]?.get).toBeDefined();
    expect(document.paths["/rounds/history"]?.get).toBeDefined();
    expect(document.paths["/rounds/{roundId}/verify"]?.get).toBeDefined();
    expect(document.paths["/bet"]?.post).toBeDefined();
    expect(document.paths["/bet/cashout"]?.post).toBeDefined();
    expect(document.paths["/bets/me"]?.get).toBeDefined();
    expect(document.paths["/bets/{id}"]?.get).toBeDefined();
    expect(document.paths["/internal/test-websocket"]).toBeUndefined();

    const placeBet = document.paths["/bet"]?.post;
    expect(placeBet?.security).toEqual([{ bearer: [] }]);

    await app.close();
  });
});
