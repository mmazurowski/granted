import { PolicyMalformed } from "./errors";
import { isValid } from "./validation";

describe("validation", () => {
  it("should fail with and error when passed null", () => {
    const { value, error } = isValid(null);

    expect(value).toEqual(false);
    expect(error).toBeInstanceOf(PolicyMalformed);
  });

  it("should fail with an error when passed boolean", () => {
    let result = isValid(false);

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);

    result = isValid(true);
    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);
  });

  it("should fail with an error when passed array", () => {
    let result = isValid([]);

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);

    result = isValid([1, 2, 3]);

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);
  });

  it("should contain message for each additional key in policy", () => {
    let result = isValid({
      something: "a",
      wrong: "b",
    });

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);
    expect(result?.error?.details.map((el) => el.path)).toEqual(["$.something", "$.wrong"]);
  });

  it("should fail with an error when passed number", () => {
    const result = isValid(1);

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);
    expect(result.error?.details).toEqual([
      { message: "Provided PolicyDocument is not valid JSON object.", path: "$" },
    ]);
  });

  it("should fail with an error when passed string", () => {
    let result = isValid("");

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);
    expect(result.error?.details).toEqual([
      { message: "Provided PolicyDocument is not valid JSON object.", path: "$" },
    ]);

    result = isValid("something");

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);
    expect(result.error?.details).toEqual([
      { message: "Provided PolicyDocument is not valid JSON object.", path: "$" },
    ]);
  });

  it("should fail with an error when passed object with typo", () => {
    let result = isValid({ docu: [] });

    expect(result.value).toEqual(false);
    expect(result.error).toBeInstanceOf(PolicyMalformed);
    expect(result.error?.details).toEqual([
      { path: "$", message: 'Policy is missing "documents" property.' },
      {
        message: "Document must not specify additional properties.",
        path: "$.docu",
      },
    ]);
  });
});
