type ErrorMetadata = {
  resource: string;
  actions: string[];
};

export class PermissionDenied extends Error {
  public readonly meta: ErrorMetadata;

  constructor(reason: string, meta: ErrorMetadata) {
    super(reason);
    this.meta = meta;
  }

  public static ResourceNotAllowed(meta: ErrorMetadata) {
    return new PermissionDenied(`Policy does not allow to access to the ${meta.resource}.`, meta);
  }

  public static ActionsNotAllowed(meta: ErrorMetadata) {
    return new PermissionDenied(
      `Policy does not allow to perform "${meta.actions.join(", ")}" on ${meta.resource}.`,
      meta,
    );
  }
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
