export type Policy = {
  documents: {
    resource: string;
    actions: string[];
  }[];
};

export type Result<TSuccess, TFail = TSuccess, TError extends Error = Error> =
  | { value: TSuccess; error?: never }
  | { value: TFail; error: TError };
