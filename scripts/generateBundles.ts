import { exec } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const __dirname = import.meta.dirname;
const fixturesFilepath = join(__dirname, "..", "src", "utils", "__fixtures__");

const Version = {
  v2: "v2",
  v3: "v3",
} as const;
type Version = (typeof Version)[keyof typeof Version];

const inputpath = {
  [Version.v2]: join(fixturesFilepath, "v2", "index.mjs"),
  [Version.v3]: join(fixturesFilepath, "v3", "index.mjs"),
};

const getWebpackCommand = (version: Version) =>
  `npx webpack ${inputpath[version]} --output-filename ${[
    "webpack",
    version,
    "js",
  ].join(".")}`;

for (const version of Object.values(Version)) {
  await execAsync(getWebpackCommand(version));
}
