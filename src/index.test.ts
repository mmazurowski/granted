import { PermissionDenied } from "./errors";
import { canPerformAction } from "./index";
import { Policy } from "./types";

describe("policy checker", () => {
  it("should fail when policy does not contain requested resource", () => {
    const policy: Policy = {
      documents: [
        {
          resource: "some:very:nice:resource",
          actions: ["*"],
        },
      ],
    };

    const actions = ["test"];
    const resource = "some:very:bad:resource";

    const { value, error } = canPerformAction({
      policy,
      resource,
      actions,
    });

    expect(value).toEqual(false);
    expect(error).toBeInstanceOf(PermissionDenied);
    expect(error?.message).toEqual("Policy does not allow to access to the some:very:bad:resource.");
  });

  it("should fail when policy does not contain requested action", () => {
    const policy: Policy = {
      documents: [
        {
          resource: "*",
          actions: ["group:action"],
        },
      ],
    };

    const result = canPerformAction({ policy, resource: "some:very:nice:resource", actions: ["otherGroup:action"] });

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PermissionDenied);
    expect(result?.error?.message).toEqual(
      'Policy does not allow to perform "otherGroup:action" on some:very:nice:resource.',
    );
  });

  it("should fail when policy contain proper resource but actions dont match", () => {
    const policy: Policy = {
      documents: [
        {
          resource: "a",
          actions: ["group:A", "group:B"],
        },
      ],
    };

    const actions = ["group:C"];
    const resource = "a";

    const result = canPerformAction({ policy, resource, actions });

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PermissionDenied);
    expect(result?.error?.message).toEqual('Policy does not allow to perform "group:C" on a.');
  });

  it("should fail when actions match but resource does not", () => {
    const policy: Policy = {
      documents: [
        {
          resource: "a",
          actions: ["group:A", "group:B"],
        },
      ],
    };

    const resource = "b";
    let actions = ["group:A"];
    let result = canPerformAction({ policy, actions, resource });
    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PermissionDenied);
    expect(result?.error?.message).toEqual("Policy does not allow to access to the b.");

    actions = ["group:B"];
    result = canPerformAction({ policy, actions, resource });
    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PermissionDenied);
    expect(result.error?.message).toEqual("Policy does not allow to access to the b.");
  });

  it("should handle duplicates in matched actions", () => {
    const policy: Policy = {
      documents: [
        {
          resource: "*",
          actions: ["group:A"],
        },
      ],
    };
    const resource = "someResource";
    const actions = ["group:A", "group:A", "group:A"];

    const result = canPerformAction({ policy, actions, resource });
    expect(result.value).toEqual(true);
    expect(result.error).toBe(undefined);
  });

  it("should handle wildcard with complex resource", () => {
    const policy: Policy = {
      documents: [
        {
          actions: ["group:A", "group:B"],
          resource: "some:complex:wildcard:*",
        },
      ],
    };

    const resource = "some:complex:wildcard:resource:name";
    const actions = ["group:A", "group:B"];

    const result = canPerformAction({ policy, actions, resource });
    expect(result.value).toEqual(true);
    expect(result.error).toBe(undefined);
  });

  it("should merge multiple documents into one", () => {
    const policy: Policy = {
      documents: [
        {
          actions: ["group:A"],
          resource: "some:resource",
        },
        {
          actions: ["group:B"],
          resource: "some:resource",
        },
      ],
    };

    const resource = "some:resource";

    expect(canPerformAction({ policy, actions: ["group:A"], resource }).value).toEqual(true);
    expect(canPerformAction({ policy, actions: ["group:B"], resource }).value).toEqual(true);
    expect(canPerformAction({ policy, actions: ["group:A", "group:B"], resource }).value).toEqual(true);
  });

  it("should handle actions with group wildard", () => {
    const policy: Policy = {
      documents: [
        {
          actions: ["groupA:*"],
          resource: "some:very:nice:resource",
        },
      ],
    };

    const resource = "some:very:nice:resource";
    const actions = ["groupA:doSomething"];

    const { value, error } = canPerformAction({ policy, resource, actions });
    expect(value).toEqual(true);
    expect(error).toBe(undefined);
  });

  it("should normalize actions to lowercase", () => {
    const policy: Policy = {
      documents: [
        {
          resource: "*",
          actions: ["settings:UpdateSetting", "settings:QuerySetting"],
        },
      ],
    };
    const resource = "someResource";
    const actions = ["settings:updatesetting", "settings:querysetting"];

    const result = canPerformAction({ policy, actions, resource });
    expect(result.value).toEqual(true);
    expect(result.error).toBe(undefined);
  });

  it("should normalize resource to lowercase", () => {
    const policy: Policy = {
      documents: [
        {
          resource: "some:Nice:Resource",
          actions: ["settings:UpdateSetting", "settings:QuerySetting"],
        },
      ],
    };
    const resource = "some:nice:resource";
    const actions = ["settings:updatesetting", "settings:querysetting"];

    const result = canPerformAction({ policy, actions, resource });
    expect(result.value).toEqual(true);
    expect(result.error).toBe(undefined);
  });
});
