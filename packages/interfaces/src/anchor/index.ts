export interface IAnchorDepositInfo {
  chainID: bigint;
  secret: bigint;
  nullifier: bigint;
  commitment: string;
  nullifierHash: string;
};

export interface IAnchorDeposit {
  deposit: IAnchorDepositInfo;
  index: number;
  originChainId: bigint;
};

export interface IFixedAnchorPublicInputs {
  _roots: string;
  _nullifierHash: string;
  _refreshCommitment: string;
  _recipient: string;
  _relayer: string;
  _fee: string;
  _refund: string;
}
