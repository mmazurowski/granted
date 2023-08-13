import { Policy, Action } from "./types";
import { ResourcePolicy, RequestPolicy } from "./types";

export const createResourcePolicy = (resource: string, actions: Action[]): ResourcePolicy => {
  return [
    {
      resource,
      actions,
    },
  ] as ResourcePolicy;
};

export const createRequestPolicy = (policy: Policy): RequestPolicy => {
  return policy as RequestPolicy;
};
