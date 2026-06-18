import { EVENT_BROADCASTER, type EventBroadcaster } from "@crash/websocket";
import { Inject, Injectable } from "@nestjs/common";
import { GameRound } from "../../domain/entities/game-round.entity";
import {
  WebSocketRoundEvents,
  type RoundBettingOpenedWebSocketPayload,
  type RoundCrashedWebSocketPayload,
  type RoundFinishedWebSocketPayload,
  type RoundRunningWebSocketPayload,
} from "./contracts/websocket-round-events";

@Injectable()
export class RoundWebSocketNotifier {
  public constructor(
    @Inject(EVENT_BROADCASTER)
    private readonly eventBroadcaster: EventBroadcaster,
  ) {}

  public async notifyBettingOpened(round: GameRound): Promise<void> {
    const payload: RoundBettingOpenedWebSocketPayload = {
      roundId: round.id,
      status: "BETTING",
      bettingEndsAt: round.bettingEndsAt!.toISOString(),
      serverSeedHash: round.serverSeedHash!,
      clientSeed: round.clientSeed!,
      nonce: round.nonce!,
    };

    await this.eventBroadcaster.broadcast(WebSocketRoundEvents.BettingOpened, payload);
  }

  public async notifyRunning(round: GameRound, growthFactor: number): Promise<void> {
    const payload: RoundRunningWebSocketPayload = {
      roundId: round.id,
      startedAt: round.startedAt!.toISOString(),
      serverTime: new Date().toISOString(),
      growthFactor,
    };

    await this.eventBroadcaster.broadcast(WebSocketRoundEvents.Running, payload);
  }

  public async notifyCrashed(round: GameRound): Promise<void> {
    const payload: RoundCrashedWebSocketPayload = {
      roundId: round.id,
      crashPoint: round.crashPoint!.value,
      crashedAt: round.crashedAt!.toISOString(),
      serverSeed: round.serverSeed!,
      serverSeedHash: round.serverSeedHash!,
      clientSeed: round.clientSeed!,
      nonce: round.nonce!,
    };

    await this.eventBroadcaster.broadcast(WebSocketRoundEvents.Crashed, payload);
  }

  public async notifyFinished(round: GameRound): Promise<void> {
    const payload: RoundFinishedWebSocketPayload = {
      roundId: round.id,
      finishedAt: round.finishedAt!.toISOString(),
    };

    await this.eventBroadcaster.broadcast(WebSocketRoundEvents.Finished, payload);
  }
}
