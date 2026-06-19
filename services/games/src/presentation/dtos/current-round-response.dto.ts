import { ApiProperty } from "@nestjs/swagger";
import { GameRound } from "../../domain/entities/game-round.entity";
import { RoundStatus } from "../../domain/enums/round-status.enum";
import type { Bet } from "../../domain/entities/bet.entity";
import { RoundBetPublicDto } from "./round-bet-public.dto";

function formatMultiplierValue(value: number): string {
  return value.toFixed(2);
}

export class CurrentRoundResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: RoundStatus, enumName: "RoundStatus" })
  status!: RoundStatus;

  @ApiProperty({ example: "1.50", nullable: true })
  currentMultiplier!: string | null;

  @ApiProperty({ example: "2.34", nullable: true })
  crashPoint!: string | null;

  @ApiProperty({ nullable: true })
  serverSeedHash!: string | null;

  @ApiProperty({ nullable: true })
  clientSeed!: string | null;

  @ApiProperty({ nullable: true })
  nonce!: number | null;

  @ApiProperty({ format: "date-time", nullable: true })
  bettingEndsAt!: string | null;

  @ApiProperty({ format: "date-time", nullable: true })
  startedAt!: string | null;

  @ApiProperty({ format: "date-time", nullable: true })
  crashedAt!: string | null;

  @ApiProperty({ format: "date-time", nullable: true })
  finishedAt!: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;

  @ApiProperty({ type: [RoundBetPublicDto] })
  bets!: RoundBetPublicDto[];

  public static fromDomain(gameRound: GameRound, bets: Bet[] = []): CurrentRoundResponseDto {
    const dto = new CurrentRoundResponseDto();
    const exposesFairness =
      gameRound.status === RoundStatus.Betting || gameRound.status === RoundStatus.Running;

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
    dto.serverSeedHash = exposesFairness ? gameRound.serverSeedHash : null;
    dto.clientSeed = exposesFairness ? gameRound.clientSeed : null;
    dto.nonce = exposesFairness ? gameRound.nonce : null;
    dto.bettingEndsAt = gameRound.bettingEndsAt?.toISOString() ?? null;
    dto.startedAt = gameRound.startedAt?.toISOString() ?? null;
    dto.crashedAt = gameRound.crashedAt?.toISOString() ?? null;
    dto.finishedAt = gameRound.finishedAt?.toISOString() ?? null;
    dto.createdAt = gameRound.createdAt.toISOString();
    dto.bets = RoundBetPublicDto.fromDomainMany(bets, gameRound.status);

    return dto;
  }
}
