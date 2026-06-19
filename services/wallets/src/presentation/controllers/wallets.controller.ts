import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@crash/auth";
import { CurrentUser, JwtAuthGuard } from "@crash/auth";
import { CreateWalletUseCase } from "../../application/use-cases/create-wallet/create-wallet.use-case";
import { GetWalletByPlayerIdUseCase } from "../../application/use-cases/get-wallet-by-player-id/get-wallet-by-player-id.use-case";
import { HealthCheckResponseDto } from "../dtos/health-check-response.dto";
import { WalletResponseDto } from "../dtos/wallet-response.dto";

@ApiTags("wallets")
@Controller()
export class WalletsController {
  public constructor(
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletByPlayerIdUseCase: GetWalletByPlayerIdUseCase,
  ) {}

  @Get("health")
  @ApiTags("health")
  @ApiOperation({ summary: "Health check" })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  check(): HealthCheckResponseDto {
    return { status: "ok", service: "wallets" };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("bearer")
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Cria carteira para o jogador autenticado" })
  @ApiCreatedResponse({ type: WalletResponseDto })
  async create(@CurrentUser() user: AuthenticatedUser): Promise<WalletResponseDto> {
    const wallet = await this.createWalletUseCase.execute({ playerId: user.id });

    return WalletResponseDto.fromDomain(wallet);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("bearer")
  @Get("me")
  @ApiOperation({ summary: "Retorna carteira e saldo do jogador" })
  @ApiOkResponse({ type: WalletResponseDto })
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<WalletResponseDto> {
    const wallet = await this.getWalletByPlayerIdUseCase.execute(user.id);

    return WalletResponseDto.fromDomain(wallet);
  }
}
