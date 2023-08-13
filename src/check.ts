import { PermissionDenied, PermissionReason } from "./errors";
import { Result, RequestPolicy, ResourcePolicy } from "./types";
import { WILDCARD } from "./constants";

type CheckArgs = {
  resource: ResourcePolicy;
  request: RequestPolicy;
};

export const check = (args: CheckArgs): Result<true, false> => {
  const { actions, resource } = args.request[0];
  const policy = args.resource;

  const normalizedActions = actions.map((el) => el.trim().toLowerCase());

  const documentWithMatchingResource = policy.filter(
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
