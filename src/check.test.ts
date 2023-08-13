import { createRequestPolicy, createResourcePolicy } from "./api";
import { PermissionDenied } from "./errors";
import { check } from "./check";

describe("policy checker", () => {
  it("should fail when policy does not contain requested resource", () => {
    const resource = createResourcePolicy("some:very:nice:resource", ["*"]);
    const request = createRequestPolicy([{ resource: "some:very:bad:resource", actions: ["test:test"] }]);

    const { value, error } = check({
      request,
      resource,
    });

    expect(value).toEqual(false);
    expect(error).toBeInstanceOf(PermissionDenied);
    expect(error?.message).toEqual("Policy does not allow to access to the some:very:bad:resource.");
  });

  it("should fail when policy does not contain requested action", () => {
    const resource = createResourcePolicy("*", ["group:action"]);
    const request = createRequestPolicy([{ resource: "some:very:nice:resource", actions: ["otherGroup:action"] }]);

    const result = check({ request, resource });

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PermissionDenied);
    expect(result?.error?.message).toEqual(
      'Policy does not allow to perform "otherGroup:action" on some:very:nice:resource.',
    );
  });

  it("should fail when policy contain proper resource but actions dont match", () => {
    const resource = createResourcePolicy("a", ["group:A", "group:B"]);
    const request = createRequestPolicy([
      {
        actions: ["group:C"],
        resource: "a",
      },
    ]);

    const result = check({ resource, request });

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PermissionDenied);
    expect(result?.error?.message).toEqual('Policy does not allow to perform "group:C" on a.');
  });

  it("should fail when actions match but resource does not", () => {
    const resource = createResourcePolicy("a", ["group:A", "group:B"]);

    let request = createRequestPolicy([
      {
        actions: ["group:A"],
        resource: "b",
      },
    ]);

    let result = check({ request, resource });
    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PermissionDenied);
    expect(result?.error?.message).toEqual("Policy does not allow to access to the b.");

    request = createRequestPolicy([
      {
        actions: ["group:B"],
        resource: "b",
      },
    ]);

    result = check({ request, resource });
    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PermissionDenied);
    expect(result.error?.message).toEqual("Policy does not allow to access to the b.");
  });

  it("should handle duplicates in matched actions", () => {
    const resource = createResourcePolicy("*", ["group:A"]);

    const request = createRequestPolicy([
      {
        resource: "someResource",
        actions: ["group:A", "group:A", "group:A"],
      },
    ]);

    const result = check({ request, resource });
    expect(result.value).toEqual(true);
    expect(result.error).toBe(undefined);
  });

  it("should handle wildcard with complex resource", () => {
    const resource = createResourcePolicy("some:complex:wildcard:*", ["group:A", "group:B"]);
    const request = createRequestPolicy([
      {
        resource: "some:complex:wildcard:resource:name",
        actions: ["group:A", "group:B"],
      },
    ]);

    const result = check({ request, resource });
    expect(result.value).toEqual(true);
    expect(result.error).toBe(undefined);
  });

  it("should merge multiple documents into one", () => {
    const resource = createResourcePolicy("some:resource", ["group:A", "group:B"]);
    const request = createRequestPolicy([
      {
        actions: ["group:A"],
        resource: "some:resource",
      },
      {
        actions: ["group:B"],
        resource: "some:resource",
      },
    ]);

    expect(check({ request, resource }).value).toEqual(true);
  });

  it("should handle actions with group wildard", () => {
    const resource = createResourcePolicy("some:very:nice:resource", ["groupA:*"]);
    const request = createRequestPolicy([
      {
        resource: "some:very:nice:resource",
        actions: ["groupA:doSomething"],
      },
    ]);

    const { value, error } = check({ request, resource });
    expect(value).toEqual(true);
    expect(error).toBe(undefined);
  });

  it("should normalize actions to lowercase", () => {
    const resource = createResourcePolicy("*", ["settings:UpdateSetting", "settings:QuerySetting"]);

    const request = createRequestPolicy([
      {
        resource: "someResource",
        actions: ["settings:updatesetting", "settings:querysetting"],
      },
    ]);

    const result = check({ request, resource });
    expect(result.value).toEqual(true);
    expect(result.error).toBe(undefined);
  });

  it("should normalize resource to lowercase", () => {
    const resource = createResourcePolicy("some:Nice:Resource", ["settings:UpdateSetting", "settings:QuerySetting"]);
    const request = createRequestPolicy([
      {
        resource: "some:nice:resource",
        actions: ["settings:updatesetting", "settings:querysetting"],
      },
    ]);

    const result = check({ request, resource });
    expect(result.value).toEqual(true);
    expect(result.error).toBe(undefined);
  });
});
