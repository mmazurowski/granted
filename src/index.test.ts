import { Policy, PolicyStatement, canPerformAction } from "./index";

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

    const result = canPerformAction({
      policy,
      resource,
      actions,
    });

    expect(result).toEqual(false);
    expect(PolicyStatement.from(policy).can({ actions, resource })).toEqual(false);
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

    expect(result).toEqual(false);
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

    expect(canPerformAction({ policy, resource, actions })).toEqual(false);
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

    expect(canPerformAction({ policy, actions, resource })).toEqual(false);

    actions = ["group:B"];
    expect(canPerformAction({ policy, actions, resource })).toEqual(false);
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

    expect(canPerformAction({ policy, resource, actions })).toEqual(true);
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

    expect(canPerformAction({ policy, actions, resource })).toEqual(true);
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

    expect(canPerformAction({ policy, actions: ["group:A"], resource })).toEqual(true);
    expect(canPerformAction({ policy, actions: ["group:B"], resource })).toEqual(true);
    expect(canPerformAction({ policy, actions: ["group:A", "group:B"], resource })).toEqual(true);
  });
});
