import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "@crash/auth";
import { CurrentUser, JwtAuthGuard } from "@crash/auth";
import { CreateWalletUseCase } from "../../application/use-cases/create-wallet/create-wallet.use-case";
import { CreditWalletUseCase } from "../../application/use-cases/credit-wallet/credit-wallet.use-case";
import { DebitWalletUseCase } from "../../application/use-cases/debit-wallet/debit-wallet.use-case";
import { GetWalletByPlayerIdUseCase } from "../../application/use-cases/get-wallet-by-player-id/get-wallet-by-player-id.use-case";
import { CreditWalletDto } from "../dtos/credit-wallet.dto";
import { CreditWalletResponseDto } from "../dtos/credit-wallet-response.dto";
import { DebitWalletDto } from "../dtos/debit-wallet.dto";
import { DebitWalletResponseDto } from "../dtos/debit-wallet-response.dto";
import { HealthCheckResponseDto } from "../dtos/health-check-response.dto";
import { WalletResponseDto } from "../dtos/wallet-response.dto";

@Controller()
export class WalletsController {
  public constructor(
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletByPlayerIdUseCase: GetWalletByPlayerIdUseCase,
    private readonly creditWalletUseCase: CreditWalletUseCase,
    private readonly debitWalletUseCase: DebitWalletUseCase,
  ) {}

  @Get("health")
  check(): HealthCheckResponseDto {
    return { status: "ok", service: "wallets" };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthenticatedUser): Promise<WalletResponseDto> {
    const wallet = await this.createWalletUseCase.execute({ playerId: user.id });

    return WalletResponseDto.fromDomain(wallet);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<WalletResponseDto> {
    const wallet = await this.getWalletByPlayerIdUseCase.execute(user.id);

    return WalletResponseDto.fromDomain(wallet);
  }

  @Post("credit")
  @HttpCode(HttpStatus.OK)
  async credit(@Body() dto: CreditWalletDto): Promise<CreditWalletResponseDto> {
    const { wallet, transaction } = await this.creditWalletUseCase.execute({
      walletId: dto.walletId,
      amountCents: dto.amountCents,
      referenceId: dto.referenceId,
    });

    return CreditWalletResponseDto.fromDomain(wallet, transaction);
  }

  @Post("debit")
  @HttpCode(HttpStatus.OK)
  async debit(@Body() dto: DebitWalletDto): Promise<DebitWalletResponseDto> {
    const { wallet, transaction } = await this.debitWalletUseCase.execute({
      walletId: dto.walletId,
      amountCents: dto.amountCents,
      referenceId: dto.referenceId,
    });

    return DebitWalletResponseDto.fromDomain(wallet, transaction);
  }
}
