export type Fee = {
  feePercentage: number;
  feeType: string;
}

export type Count = {
  count: number;
}

export type Any = string | number | undefined | boolean | null | string[] | number[];

export type AnyRecord = Record<string, Any>;

export type GameInstance = {
  ownerId: string;
  name: string;
  desc: string;
  image: string;
  blockchain: number;
  escrow: string;
  royalty: number;
  stardustFee: number;
  news: null;
  id: number;
  fees: Fee[];
  bucketName: string;
}
