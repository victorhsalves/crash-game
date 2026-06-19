import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@crash/auth";
import { CurrentUser, JwtAuthGuard } from "@crash/auth";
import { GetBetByIdUseCase } from "../../application/use-cases/get-bet-by-id/get-bet-by-id.use-case";
import { GetPlayerBetHistoryUseCase } from "../../application/use-cases/get-player-bet-history/get-player-bet-history.use-case";
import { GetRoundHistoryUseCase } from "../../application/use-cases/get-round-history/get-round-history.use-case";
import { PlaceBetUseCase } from "../../application/use-cases/place-bet/place-bet.use-case";
import { VerifyRoundUseCase } from "../../application/use-cases/verify-round/verify-round.use-case";
import { CashoutBetUseCase } from "../../application/use-cases/cashout-bet/cashout-bet.use-case";
import { BetWebSocketNotifier } from "../../infrastructure/websocket/bet-websocket.notifier";
import { ApiErrorResponseDto } from "../dtos/api-error-response.dto";
import { BetResponseDto } from "../dtos/bet-response.dto";
import { CashoutBetResponseDto } from "../dtos/cashout-bet-response.dto";
import { CurrentRoundResponseDto } from "../dtos/current-round-response.dto";
import { GetCurrentRoundUseCase } from "../../application/use-cases/get-current-round/get-current-round.use-case";
import { HealthCheckResponseDto } from "../dtos/health-check-response.dto";
import { PlaceBetDto } from "../dtos/place-bet.dto";
import { PlaceBetResponseDto } from "../dtos/place-bet-response.dto";
import { PlayerBetHistoryResponseDto } from "../dtos/player-bet-history-response.dto";
import { RoundHistoryResponseDto } from "../dtos/round-history-response.dto";
import { VerifyRoundResponseDto } from "../dtos/verify-round-response.dto";

@ApiTags("games")
@Controller()
export class GamesController {
  public constructor(
    private readonly getCurrentRoundUseCase: GetCurrentRoundUseCase,
    private readonly placeBetUseCase: PlaceBetUseCase,
    private readonly cashoutBetUseCase: CashoutBetUseCase,
    private readonly betWebSocketNotifier: BetWebSocketNotifier,
    private readonly getBetByIdUseCase: GetBetByIdUseCase,
    private readonly getPlayerBetHistoryUseCase: GetPlayerBetHistoryUseCase,
    private readonly verifyRoundUseCase: VerifyRoundUseCase,
    private readonly getRoundHistoryUseCase: GetRoundHistoryUseCase,
  ) {}

  @Get("health")
  @ApiTags("health")
  @ApiOperation({ summary: "Health check" })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  check(): HealthCheckResponseDto {
    return { status: "ok", service: "games" };
  }

  @Get("rounds/current")
  @ApiTags("rounds")
  @ApiOperation({ summary: "Estado da rodada atual com apostas" })
  @ApiOkResponse({ type: CurrentRoundResponseDto })
  async getCurrentRound(): Promise<CurrentRoundResponseDto> {
    const { round, bets } = await this.getCurrentRoundUseCase.execute();

    return CurrentRoundResponseDto.fromDomain(round, bets);
  }

  @Get("rounds/history")
  @ApiTags("rounds")
  @ApiOperation({ summary: "Histórico paginado de rodadas" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "offset", required: false, type: Number, example: 0 })
  @ApiOkResponse({ type: RoundHistoryResponseDto })
  async getRoundHistory(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ): Promise<RoundHistoryResponseDto> {
    const parsedLimit = limit !== undefined ? Number.parseInt(limit, 10) : undefined;
    const parsedOffset = offset !== undefined ? Number.parseInt(offset, 10) : undefined;
    const result = await this.getRoundHistoryUseCase.execute({
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
      offset: Number.isFinite(parsedOffset) ? parsedOffset : undefined,
    });

    return RoundHistoryResponseDto.fromResult(result);
  }

  @Get("rounds/:roundId/verify")
  @ApiTags("rounds")
  @ApiOperation({ summary: "Dados de verificação provably fair" })
  @ApiParam({ name: "roundId", format: "uuid" })
  @ApiOkResponse({ type: VerifyRoundResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  async verifyRound(@Param("roundId") roundId: string): Promise<VerifyRoundResponseDto> {
    const result = await this.verifyRoundUseCase.execute({ roundId });
    return VerifyRoundResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("bearer")
  @Post("bet")
  @ApiTags("bets")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Fazer aposta na rodada atual" })
  @ApiCreatedResponse({ type: PlaceBetResponseDto })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto })
  @ApiResponse({ status: 422, type: ApiErrorResponseDto })
  async placeBet(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PlaceBetDto,
  ): Promise<PlaceBetResponseDto> {
    const result = await this.placeBetUseCase.execute({
      playerId: user.id,
      playerUsername: user.username,
      amountCents: dto.amountCents,
      socketId: dto.socketId,
    });

    return PlaceBetResponseDto.create(result.betId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("bearer")
  @Post("bet/cashout")
  @ApiTags("bets")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sacar no multiplicador atual" })
  @ApiOkResponse({ type: CashoutBetResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto })
  @ApiResponse({ status: 422, type: ApiErrorResponseDto })
  async cashout(@CurrentUser() user: AuthenticatedUser): Promise<CashoutBetResponseDto> {
    const result = await this.cashoutBetUseCase.execute({ playerId: user.id });

    await this.betWebSocketNotifier.notifyCashedOut(result);

    return CashoutBetResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("bearer")
  @Get("bets/me")
  @ApiTags("bets")
  @ApiOperation({ summary: "Histórico de apostas do jogador (paginado)" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "offset", required: false, type: Number, example: 0 })
  @ApiOkResponse({ type: PlayerBetHistoryResponseDto })
  async getMyBets(
    @CurrentUser() user: AuthenticatedUser,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ): Promise<PlayerBetHistoryResponseDto> {
    const parsedLimit = limit !== undefined ? Number.parseInt(limit, 10) : undefined;
    const parsedOffset = offset !== undefined ? Number.parseInt(offset, 10) : undefined;
    const result = await this.getPlayerBetHistoryUseCase.execute({
      playerId: user.id,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
      offset: Number.isFinite(parsedOffset) ? parsedOffset : undefined,
    });

    return PlayerBetHistoryResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("bearer")
  @Get("bets/:id")
  @ApiTags("bets")
  @ApiOperation({ summary: "Obter aposta por ID" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ type: BetResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
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
