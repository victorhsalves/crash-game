import type { DebitFailureReason } from "@crash/messaging";
import { Inject, Injectable } from "@nestjs/common";
import type { BetRepository } from "../../../domain/repositories/bet.repository";
import { BetWebSocketNotifier } from "../../../infrastructure/websocket/bet-websocket.notifier";
import { BET_REPOSITORY } from "../../common/tokens";
import { BetNotFoundError } from "../../errors/bet-not-found.error";

@Injectable()
export class ProcessWalletDebitedUseCase {
  public constructor(
    @Inject(BET_REPOSITORY)
    private readonly betRepository: BetRepository,
    private readonly betWebSocketNotifier: BetWebSocketNotifier,
  ) {}

  public async execute(betId: string): Promise<void> {
    const bet = await this.betRepository.findById(betId);

    if (bet === null) {
      throw BetNotFoundError.create();
    }

    bet.accept();
    await this.betRepository.save(bet);
    await this.betWebSocketNotifier.notifyAccepted(bet);
  }
}
