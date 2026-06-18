export interface FairnessState {
  readonly id: number;
  readonly terminalSeed: string;
  readonly chainHeadHash: string;
  readonly chainLength: number;
  readonly currentChainIndex: number;
  readonly nextRoundNonce: number;
  readonly updatedAt: Date;
}

export interface FairnessStateRepository {
  getState(): Promise<FairnessState | null>;
  saveState(state: FairnessState): Promise<void>;
}
