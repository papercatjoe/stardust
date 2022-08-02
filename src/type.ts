export type Fee = {
  feePercentage: number;
  feeType: string;
}

export type Count = {
  count: number;
}

export type Any = string | number | undefined | boolean | null | string[] | number[];

export type AnyRecord = Record<string, Any>;
