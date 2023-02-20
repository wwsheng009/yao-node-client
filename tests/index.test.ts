import { Add } from "../src/app/scripts/fs";

describe("testing index file", () => {
  test("empty string should result in zero", () => {
    expect(Add(1, 2)).toBe(3);
  });
});
