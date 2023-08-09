type PolicyDocument = {
  resource: string;
  actions: string[];
};

export type Policy = {
  documents: PolicyDocument[];
};

export const validate = (policy: Policy): Result<boolean> => {
  if (false) {
    return { error: new PolicyValidationError("Policy is not valid"), value: undefined };
  }

  return { value: true, error: undefined };
};

type Result<T> = { value: T; error?: never } | { value?: never; error: Error };

class PolicyValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

type CanPerformActionArgs = {
  actions: string[];
  resource: string;
  policy: Policy;
};

const WILDCARD = "*";

export const canPerformAction = (args: CanPerformActionArgs): boolean => {
  const { actions, resource, policy } = args;

  const documentForWildcard = policy.documents
    .filter((el) => el.resource === WILDCARD || resource.startsWith(el.resource.replaceAll(WILDCARD, "")))
    .reduce((prev, next) => ({ ...prev, actions: prev.actions.concat(next.actions) }), { resource, actions: [] });

  const matchingActionsOrWildcard = documentForWildcard.actions.filter((el) => el === "*" || actions.includes(el));

  if (matchingActionsOrWildcard.length === 1 || [...new Set(matchingActionsOrWildcard)].length === actions.length) {
    return true;
  }

  return false;
};

type CanArgs = Omit<CanPerformActionArgs, "policy">;

export class PolicyStatement {
  private readonly policy: Policy;

  private constructor(policy: Policy) {
    this.policy = policy;
  }

  public static from(policy: Policy) {
    return new PolicyStatement(policy);
  }

  public can(args: CanArgs): boolean {
    return canPerformAction({ policy: this.policy, actions: args.actions, resource: args.resource });
  }
}
