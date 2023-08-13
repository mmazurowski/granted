import { PermissionDenied, PermissionReason } from "./errors";
import { Policy, Result } from "./types";

type Request = {
  actions: string[];
  resource: string;
};

type CanPerformActionArgs = Request & {
  policy: Policy;
};

const WILDCARD = "*";

export const canPerformAction = (args: CanPerformActionArgs): Result<true, false> => {
  const { actions, resource, policy } = args;
  const normalizedActions = actions.map((el) => el.trim().toLowerCase());

  const documentWithMatchingResource = policy.documents.filter(
    (el) =>
      el.resource === WILDCARD || resource.toLowerCase().startsWith(el.resource.toLowerCase().replaceAll(WILDCARD, "")),
  );

  const documentForWildcard = documentWithMatchingResource.reduce(
    (prev, next) => ({ ...prev, actions: prev.actions.concat(next.actions) }),
    { resource, actions: [] },
  );

  const wildcardActionRegex = /(.*):\*/;
  const matchingActionsOrWildcard = documentForWildcard.actions.filter((el) => {
    const groups = el.match(wildcardActionRegex);

    if (groups === null) {
      return el === "*" || normalizedActions.includes(el.toLowerCase());
    }
    if (el === groups[0]) {
      return true;
    }
  });

  if (matchingActionsOrWildcard.length === 1 || [...new Set(matchingActionsOrWildcard)].length === actions.length) {
    return { value: true };
  }

  if (documentWithMatchingResource.length === 0) {
    return {
      value: false,
      error: new PermissionDenied(PermissionReason.RESOURCE_NOT_ALLOWED, {
        actions,
        resource,
      }),
    };
  }

  return {
    value: false,
    error: new PermissionDenied(PermissionReason.ACTIONS_NOT_ALLOWED, { actions, resource }),
  };
};
