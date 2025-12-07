import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { hasSdkV2InBundle } from "./hasSdkV2InBundle";

describe("hasSdkV2InBundle", () => {
  const fixturesDir = join(__dirname, "__fixtures__");
  const files = readdirSync(fixturesDir).filter((file) =>
    statSync(join(fixturesDir, file)).isFile()
  );

  files.forEach((file) => {
    it(`returns '${
      file.endsWith("v2.js") ? "true" : "false"
    }' for '${file}'`, () => {
      const content = readFileSync(join(fixturesDir, file), "utf-8");
      const expected = file.endsWith("v2.js");
      expect(hasSdkV2InBundle(content)).toBe(expected);
    });
  });
});
