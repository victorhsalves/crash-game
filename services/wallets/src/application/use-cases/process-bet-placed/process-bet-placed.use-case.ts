import {
  createIntegrationEvent,
  createIntegrationEventEnvelope,
  EVENT_PUBLISHER,
  type EventPublisher,
  WALLET_DEBIT_FAILED,
  WALLET_DEBITED,
  DebitFailureReason,
} from "@crash/messaging";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InsufficientBalanceError } from "../../../domain/errors/insufficient-balance.error";
import { DuplicateTransactionReferenceError } from "../../errors/duplicate-transaction-reference.error";
import { WalletNotFoundError } from "../../errors/wallet-not-found.error";
import { DebitWalletUseCase } from "../debit-wallet/debit-wallet.use-case";
import { GetWalletByPlayerIdUseCase } from "../get-wallet-by-player-id/get-wallet-by-player-id.use-case";
import type { ProcessBetPlacedInput } from "./process-bet-placed.input";

@Injectable()
export class ProcessBetPlacedUseCase {
  private readonly logger = new Logger(ProcessBetPlacedUseCase.name);

  public constructor(
    private readonly getWalletByPlayerIdUseCase: GetWalletByPlayerIdUseCase,
    private readonly debitWalletUseCase: DebitWalletUseCase,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
  ) {}

  public async execute(input: ProcessBetPlacedInput): Promise<void> {
    const { payload } = input;

    try {
      const wallet = await this.getWalletByPlayerIdUseCase.execute(payload.playerId);

      await this.debitWalletUseCase.execute({
        walletId: wallet.id,
        amountCents: Number(payload.amount),
        referenceId: payload.betId,
      });

      await this.publishDebited(payload.betId);
    } catch (error) {
      if (error instanceof DuplicateTransactionReferenceError) {
        this.logger.log(
          `[messaging] bet.placed already processed for betId=${payload.betId}, skipping.`,
        );
        return;
      }

      if (error instanceof InsufficientBalanceError) {
        await this.publishDebitFailed(payload.betId, DebitFailureReason.InsufficientFunds);
        return;
      }

      if (error instanceof WalletNotFoundError) {
        await this.publishDebitFailed(payload.betId, DebitFailureReason.WalletNotFound);
        return;
      }

      this.logger.error(
        `[messaging] unexpected error processing bet.placed for betId=${payload.betId}`,
        error instanceof Error ? error.stack : String(error),
      );

      await this.publishDebitFailed(payload.betId, DebitFailureReason.InternalError);
    }
  }

  private async publishDebited(betId: string): Promise<void> {
    const event = createIntegrationEvent({
      eventType: WALLET_DEBITED,
      aggregateId: betId,
      payload: { betId },
    });

    await this.eventPublisher.publish(WALLET_DEBITED, createIntegrationEventEnvelope(event));
  }

  private async publishDebitFailed(
    betId: string,
    reason: DebitFailureReason,
  ): Promise<void> {
    const event = createIntegrationEvent({
      eventType: WALLET_DEBIT_FAILED,
      aggregateId: betId,
      payload: { betId, reason },
    });

    await this.eventPublisher.publish(WALLET_DEBIT_FAILED, createIntegrationEventEnvelope(event));
  }
}
