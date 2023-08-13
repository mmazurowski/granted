import { Result } from "./types";
import { PolicyMalformed } from "./errors";
import { WILDCARD, SEPARATOR } from "./constants";

const actionValidation = (action: string): boolean => {
  if (action.length === 0) {
    return false;
  }

  if (action === WILDCARD) {
    return true;
  }

  const splitted = action.split(SEPARATOR);

  if (splitted.length !== 3) {
    return false;
  }

  const text = /[\w\W]*/;
  const [group, separator, groupAction] = splitted;

  return text.test(group.trim()) && separator === SEPARATOR && text.test(groupAction.trim());
};

export const isValid = (policy: any): Result<true, false, PolicyMalformed> => {
  if (policy === null || typeof policy !== "object" || Array.isArray(policy)) {
    return {
      value: false,
      error: new PolicyMalformed("Policy is not valid JSON object.", [
        {
          path: "$",
          message: "Provided PolicyDocument is not valid JSON object.",
        },
      ]),
    };
  }

  const keys = Object.keys(policy);

  if (keys.length === 0) {
    return {
      value: false,
      error: new PolicyMalformed("Provided policy is not valid PolicyDocument.", [
        {
          path: "$",
          message: "PolicyDocument is empty object",
        },
        {
          path: "$",
          message: 'Missing "documents" property.',
        },
      ]),
    };
  }

  if (keys.length > 1) {
    const wrongKeys = keys.filter((el) => el !== "documents");

    return {
      value: false,
      error: new PolicyMalformed(
        "Provided policy is not valid PolicyDocument",
        wrongKeys.map((el) => ({
          path: `$.${el}`,
          message: `Document must not specify additional properties.`,
        })),
      ),
    };
  }

  if (keys[0] !== "documents") {
    return {
      value: false,
      error: new PolicyMalformed("Provided policy is not valid PolicyDocument", [
        {
          path: "$",
          message: 'Policy is missing "documents" property.',
        },
        {
          path: `$.${keys[0]}`,
          message: "Document must not specify additional properties.",
        },
      ]),
    };
  }

  return { value: true };
};
