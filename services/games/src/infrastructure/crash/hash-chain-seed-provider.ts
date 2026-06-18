import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  buildHashChainWithProvider,
  nodeCryptoProvider,
  randomSeedHex,
  sha256Sync,
} from "@crash/provably-fair";
import { CLIENT_SEED, HASH_CHAIN_LENGTH } from "../../application/common/fairness.constants";
import { FAIRNESS_STATE_REPOSITORY } from "../../application/common/tokens";
import type { FairnessStateRepository } from "../../domain/repositories/fairness-state.repository";

export interface NextRoundSeedAssignment {
  readonly serverSeed: string;
  readonly serverSeedHash: string;
  readonly clientSeed: string;
  readonly nonce: number;
  readonly chainIndex: number;
}

@Injectable()
export class HashChainSeedProvider implements OnApplicationBootstrap {
  private static readonly StateId = 1;

  private readonly logger = new Logger(HashChainSeedProvider.name);

  public constructor(
    @Inject(FAIRNESS_STATE_REPOSITORY)
    private readonly fairnessStateRepository: FairnessStateRepository,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    const state = await this.fairnessStateRepository.getState();

    if (state === null) {
      await this.initializeChain();
      this.logger.log("Initialized provably fair hash chain.");
      return;
    }

    this.logger.log(
      `Loaded provably fair state with chain index ${state.currentChainIndex} and nonce ${state.nextRoundNonce}.`,
    );
  }

  public async assignNextSeed(): Promise<NextRoundSeedAssignment> {
    const state = await this.requireState();

    if (state.currentChainIndex < 0) {
      await this.initializeChain();
      return this.assignNextSeed();
    }

    const serverSeed = this.resolveSeedAtIndex(
      state.terminalSeed,
      state.chainLength,
      state.currentChainIndex,
    );
    const serverSeedHash = sha256Sync(serverSeed);
    const nonce = state.nextRoundNonce;
    const chainIndex = state.currentChainIndex;

    await this.fairnessStateRepository.saveState({
      ...state,
      currentChainIndex: state.currentChainIndex - 1,
      nextRoundNonce: state.nextRoundNonce + 1,
      updatedAt: new Date(),
    });

    return {
      serverSeed,
      serverSeedHash,
      clientSeed: CLIENT_SEED,
      nonce,
      chainIndex,
    };
  }

  private async requireState() {
    const state = await this.fairnessStateRepository.getState();

    if (state === null) {
      await this.initializeChain();
      return this.requireState();
    }

    return state;
  }

  private async initializeChain(): Promise<void> {
    const terminalSeed = randomSeedHex();
    const built = await buildHashChainWithProvider(nodeCryptoProvider, HASH_CHAIN_LENGTH, terminalSeed);

    await this.fairnessStateRepository.saveState({
      id: HashChainSeedProvider.StateId,
      terminalSeed,
      chainHeadHash: built.headHash,
      chainLength: HASH_CHAIN_LENGTH,
      currentChainIndex: HASH_CHAIN_LENGTH - 1,
      nextRoundNonce: 1,
      updatedAt: new Date(),
    });
  }

  private resolveSeedAtIndex(terminalSeed: string, chainLength: number, index: number): string {
    let seed = terminalSeed;

    for (let position = chainLength - 1; position > index; position -= 1) {
      seed = sha256Sync(seed);
    }

    return seed;
  }
}
