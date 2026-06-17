import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { AuthenticatedUser } from "@crash/auth";
import { CurrentUser, JwtAuthGuard } from "@crash/auth";
import { GetBetByIdUseCase } from "../../application/use-cases/get-bet-by-id/get-bet-by-id.use-case";
import { PlaceBetUseCase } from "../../application/use-cases/place-bet/place-bet.use-case";
import { BetResponseDto } from "../dtos/bet-response.dto";
import { CurrentRoundResponseDto } from "../dtos/current-round-response.dto";
import { GetCurrentRoundUseCase } from "../../application/use-cases/get-current-round/get-current-round.use-case";
import { HealthCheckResponseDto } from "../dtos/health-check-response.dto";
import { PlaceBetDto } from "../dtos/place-bet.dto";
import { PlaceBetResponseDto } from "../dtos/place-bet-response.dto";

@Controller()
export class GamesController {
  public constructor(
    private readonly getCurrentRoundUseCase: GetCurrentRoundUseCase,
    private readonly placeBetUseCase: PlaceBetUseCase,
    private readonly getBetByIdUseCase: GetBetByIdUseCase,
  ) {}

  @Get("health")
  check(): HealthCheckResponseDto {
    return { status: "ok", service: "games" };
  }

  @Get("rounds/current")
  async getCurrentRound(): Promise<CurrentRoundResponseDto> {
    const gameRound = await this.getCurrentRoundUseCase.execute();

    return CurrentRoundResponseDto.fromDomain(gameRound);
  }

  @UseGuards(JwtAuthGuard)
  @Post("bet")
  @HttpCode(HttpStatus.CREATED)
  async placeBet(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PlaceBetDto,
  ): Promise<PlaceBetResponseDto> {
    const result = await this.placeBetUseCase.execute({
      playerId: user.id,
      amountCents: dto.amountCents,
      socketId: dto.socketId,
    });

    return PlaceBetResponseDto.create(result.betId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("bets/:id")
  async getBetById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") betId: string,
  ): Promise<BetResponseDto> {
    const bet = await this.getBetByIdUseCase.execute({
      betId,
      playerId: user.id,
    });

    return BetResponseDto.fromDomain(bet);
  }
}
