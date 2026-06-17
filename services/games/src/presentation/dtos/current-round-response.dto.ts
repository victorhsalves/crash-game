import { GameRound } from "../../domain/entities/game-round.entity";
import { RoundStatus } from "../../domain/enums/round-status.enum";

function formatMultiplierValue(value: number): string {
  return value.toFixed(2);
}

export class CurrentRoundResponseDto {
  id!: string;
  status!: RoundStatus;
  currentMultiplier!: string | null;
  crashPoint!: string | null;
  bettingEndsAt!: string | null;
  startedAt!: string | null;
  crashedAt!: string | null;
  finishedAt!: string | null;
  createdAt!: string;

  public static fromDomain(gameRound: GameRound): CurrentRoundResponseDto {
    const dto = new CurrentRoundResponseDto();

    dto.id = gameRound.id;
    dto.status = gameRound.status;
    dto.currentMultiplier =
      gameRound.status === RoundStatus.Running
        ? formatMultiplierValue(gameRound.currentMultiplier.value)
        : null;
    dto.crashPoint =
      gameRound.status === RoundStatus.Crashed || gameRound.status === RoundStatus.Finished
        ? formatMultiplierValue(gameRound.crashPoint!.value)
        : null;
    dto.bettingEndsAt = gameRound.bettingEndsAt?.toISOString() ?? null;
    dto.startedAt = gameRound.startedAt?.toISOString() ?? null;
    dto.crashedAt = gameRound.crashedAt?.toISOString() ?? null;
    dto.finishedAt = gameRound.finishedAt?.toISOString() ?? null;
    dto.createdAt = gameRound.createdAt.toISOString();

    return dto;
  }
}
