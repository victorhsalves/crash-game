import {
  createIntegrationEvent,
  createIntegrationEventEnvelope,
  EVENT_PUBLISHER,
  type EventPublisher,
  WALLET_CREDITED,
} from "@crash/messaging";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { DuplicateTransactionReferenceError } from "../../errors/duplicate-transaction-reference.error";
import { WalletNotFoundError } from "../../errors/wallet-not-found.error";
import { CreditWalletUseCase } from "../credit-wallet/credit-wallet.use-case";
import { GetWalletByPlayerIdUseCase } from "../get-wallet-by-player-id/get-wallet-by-player-id.use-case";
import type { ProcessBetCashedOutInput } from "./process-bet-cashed-out.input";

@Injectable()
export class ProcessBetCashedOutUseCase {
  private readonly logger = new Logger(ProcessBetCashedOutUseCase.name);

  public constructor(
    private readonly getWalletByPlayerIdUseCase: GetWalletByPlayerIdUseCase,
    private readonly creditWalletUseCase: CreditWalletUseCase,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
  ) {}

  public async execute(input: ProcessBetCashedOutInput): Promise<void> {
    const { payload } = input;

    try {
      const wallet = await this.getWalletByPlayerIdUseCase.execute(payload.playerId);

      await this.creditWalletUseCase.execute({
        walletId: wallet.id,
        amountCents: Number(payload.payoutAmount),
        referenceId: `${payload.betId}:credit`,
      });

      await this.publishWalletCredited(payload.betId);
    } catch (error) {
      if (error instanceof DuplicateTransactionReferenceError) {
        this.logger.log(
          `[messaging] bet.cashed-out already processed for betId=${payload.betId}, skipping.`,
        );
        return;
      }

      if (error instanceof WalletNotFoundError) {
        this.logger.error(
          `[messaging] wallet not found for playerId=${payload.playerId} on bet.cashed-out betId=${payload.betId}`,
        );
        throw error;
      }

      this.logger.error(
        `[messaging] unexpected error processing bet.cashed-out for betId=${payload.betId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  private async publishWalletCredited(betId: string): Promise<void> {
    const event = createIntegrationEvent({
      eventType: WALLET_CREDITED,
      aggregateId: betId,
      payload: { betId },
    });

    await this.eventPublisher.publish(WALLET_CREDITED, createIntegrationEventEnvelope(event));
  }
}
