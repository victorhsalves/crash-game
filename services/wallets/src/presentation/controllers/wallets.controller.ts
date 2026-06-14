import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { CreateWalletUseCase } from "../../application/use-cases/create-wallet/create-wallet.use-case";
import { CreditWalletUseCase } from "../../application/use-cases/credit-wallet/credit-wallet.use-case";
import { GetWalletByPlayerIdUseCase } from "../../application/use-cases/get-wallet-by-player-id/get-wallet-by-player-id.use-case";
import { CreateWalletDto } from "../dtos/create-wallet.dto";
import { CreditWalletDto } from "../dtos/credit-wallet.dto";
import { CreditWalletResponseDto } from "../dtos/credit-wallet-response.dto";
import { HealthCheckResponseDto } from "../dtos/health-check-response.dto";
import { WalletResponseDto } from "../dtos/wallet-response.dto";

@Controller()
export class WalletsController {
  public constructor(
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletByPlayerIdUseCase: GetWalletByPlayerIdUseCase,
    private readonly creditWalletUseCase: CreditWalletUseCase,
  ) {}

  @Get("health")
  check(): HealthCheckResponseDto {
    return { status: "ok", service: "wallets" };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWalletDto): Promise<WalletResponseDto> {
    const wallet = await this.createWalletUseCase.execute({ playerId: dto.playerId });

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

  @Get(":playerId")
  async getByPlayerId(@Param("playerId", new ParseUUIDPipe()) playerId: string): Promise<WalletResponseDto> {
    const wallet = await this.getWalletByPlayerIdUseCase.execute(playerId);

    return WalletResponseDto.fromDomain(wallet);
  }
}
