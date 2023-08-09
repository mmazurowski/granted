import { PermissionDenied } from "./errors";
import { Policy, Result } from "./types";

type Request = {
  actions: string[];
  resource: string;
};

type CanPerformActionArgs = Request & {
  policy: Policy;
};

const WILDCARD = "*";

export const canPerformAction = (args: CanPerformActionArgs): Result => {
  const { actions, resource, policy } = args;

  const documentWithMatchingResource = policy.documents.filter(
    (el) => el.resource === WILDCARD || resource.startsWith(el.resource.replaceAll(WILDCARD, "")),
  );

  const documentForWildcard = documentWithMatchingResource.reduce(
    (prev, next) => ({ ...prev, actions: prev.actions.concat(next.actions) }),
    { resource, actions: [] },
  );

  const matchingActionsOrWildcard = documentForWildcard.actions.filter((el) => el === "*" || actions.includes(el));

  if (matchingActionsOrWildcard.length === 1 || [...new Set(matchingActionsOrWildcard)].length === actions.length) {
    return { value: true };
  }

  if (documentWithMatchingResource.length === 0) {
    return { value: false, error: new PermissionDenied(`Policy does not allow to access to the ${resource}.`) };
  }

  return {
    value: false,
    error: new PermissionDenied(`Policy does not allow to perform "${actions.join(", ")}" on ${resource}.`),
  };
};
