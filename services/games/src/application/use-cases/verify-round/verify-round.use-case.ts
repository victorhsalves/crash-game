import { Inject, Injectable } from "@nestjs/common";
import { verifyRoundSync } from "@crash/provably-fair";
import { RoundStatus } from "../../../domain/enums/round-status.enum";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { MAX_CRASH_POINT } from "../../common/round-lifecycle.constants";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { GameRoundNotFoundError } from "../../errors/game-round-not-found.error";
import type { VerifyRoundInput, VerifyRoundResult } from "./verify-round.input";

function formatMultiplier(value: number): string {
  return value.toFixed(2);
}

@Injectable()
export class VerifyRoundUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
  ) {}

  public async execute(input: VerifyRoundInput): Promise<VerifyRoundResult> {
    const round = await this.gameRoundRepository.findById(input.roundId);

    if (round === null) {
      throw GameRoundNotFoundError.create();
    }

    const canRevealServerSeed =
      round.status === RoundStatus.Crashed || round.status === RoundStatus.Finished;
    const canRevealCrashPoint = canRevealServerSeed;

    if (
      round.serverSeedHash === null ||
      round.clientSeed === null ||
      round.nonce === null ||
      round.crashPoint === null
    ) {
      return {
        roundId: round.id,
        status: round.status,
        serverSeed: canRevealServerSeed ? round.serverSeed : null,
        serverSeedHash: round.serverSeedHash,
        clientSeed: round.clientSeed,
        nonce: round.nonce,
        crashPoint: canRevealCrashPoint ? formatMultiplier(round.crashPoint.value) : null,
        calculatedCrashPoint: null,
        isValid: false,
        hashValid: false,
        crashPointValid: false,
      };
    }

    const verification = verifyRoundSync({
      serverSeed: canRevealServerSeed ? round.serverSeed : null,
      serverSeedHash: round.serverSeedHash,
      clientSeed: round.clientSeed,
      nonce: round.nonce,
      crashPointBasisPoints: round.crashPoint.valueInBasisPoints,
      maxCrashPoint: MAX_CRASH_POINT,
    });

    return {
      roundId: round.id,
      status: round.status,
      serverSeed: canRevealServerSeed ? round.serverSeed : null,
      serverSeedHash: round.serverSeedHash,
      clientSeed: round.clientSeed,
      nonce: round.nonce,
      crashPoint: canRevealCrashPoint ? formatMultiplier(round.crashPoint.value) : null,
      calculatedCrashPoint:
        verification.calculatedValue !== null
          ? formatMultiplier(verification.calculatedValue)
          : null,
      isValid: verification.isValid,
      hashValid: verification.hashValid,
      crashPointValid: verification.crashPointValid,
    };
  }
}
