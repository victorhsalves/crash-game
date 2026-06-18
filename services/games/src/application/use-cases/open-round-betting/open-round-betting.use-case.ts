import { Inject, Injectable } from "@nestjs/common";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { RoundWebSocketNotifier } from "../../../infrastructure/websocket/round-websocket.notifier";
import { HashChainSeedProvider } from "../../../infrastructure/crash/hash-chain-seed-provider";
import { ROUND_BETTING_DURATION_MS } from "../../common/round-lifecycle.constants";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { GameRoundNotFoundError } from "../../errors/game-round-not-found.error";
import type { OpenRoundBettingInput, OpenRoundBettingResult } from "./open-round-betting.input";

@Injectable()
export class OpenRoundBettingUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    private readonly roundWebSocketNotifier: RoundWebSocketNotifier,
    private readonly hashChainSeedProvider: HashChainSeedProvider,
  ) {}

  public async execute(input: OpenRoundBettingInput): Promise<OpenRoundBettingResult> {
    const round = await this.gameRoundRepository.findById(input.roundId);

    if (round === null) {
      throw GameRoundNotFoundError.create();
    }

    const durationMs = input.durationMs ?? ROUND_BETTING_DURATION_MS;
    const bettingEndsAt = new Date(Date.now() + durationMs);

    round.openBetting(bettingEndsAt);

    const fairnessData = await this.hashChainSeedProvider.assignNextSeed();
    round.assignFairnessData(fairnessData);

    await this.gameRoundRepository.save(round);
    await this.roundWebSocketNotifier.notifyBettingOpened(round);

    return {
      roundId: round.id,
      status: "BETTING",
      bettingEndsAt,
    };
  }
}
