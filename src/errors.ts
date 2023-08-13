type ErrorMetadata = {
  resource: string;
  actions: string[];
};

export class PermissionDenied extends Error {
  constructor(reason: PermissionReason, meta: ErrorMetadata) {
    switch (reason) {
      case PermissionReason.RESOURCE_NOT_ALLOWED:
        super(`Policy does not allow to access to the ${meta.resource}.`);
        break;
      case PermissionReason.ACTIONS_NOT_ALLOWED:
        super(`Policy does not allow to perform "${meta.actions.join(", ")}" on ${meta.resource}.`);
    }
  }
}

export enum PermissionReason {
  ACTIONS_NOT_ALLOWED = "actions_not_allowed",
  RESOURCE_NOT_ALLOWED = "resource_not_allowed",
}

type Details = {
  path: string;
  message: string;
};

export class PolicyMalformed extends Error {
  public readonly details: Details[];

  constructor(message: string, details: Details[]) {
    super(message);
    this.details = details;
  }
}
