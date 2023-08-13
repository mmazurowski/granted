export type Action = `${string}:${string}` | "*";

export type Policy = {
  resource: string;
  actions: Action[];
}[];

export type Result<TSuccess, TFail = TSuccess, TError extends Error = Error> =
  | { value: TSuccess; error?: never }
  | { value: TFail; error: TError };

type Brand<K, T> = K & { __brand: T };

export type RequestPolicy = Brand<Policy, "request">;
export type ResourcePolicy = Brand<Policy, "resource">;
