import { Lambda, paginateListFunctions } from "@aws-sdk/client-lambda";
import unzipper from "unzipper";

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const client = new Lambda();
const tempDir = await mkdtemp(join(tmpdir(), "lambda-scan-"));

const LAMBDA_LIST_FUNCTION_LIMIT = 50;
const JS_SDK_V2_MARKER = { Y: "[Y]", N: "[N]", NA: "[N/A]" };
const PACKAGE_JSON_FILENAME = "package.json";

const downloadFile = async (url, outputPath) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  await writeFile(outputPath, response.body);
};

const getPackageJsonContents = async (zipPath) => {
  const directory = await unzipper.Open.file(zipPath);

  for (const file of directory.files) {
    // Skip anything which is not `package.json`
    if (file.path !== PACKAGE_JSON_FILENAME) continue;
    const packageJsonContents = await file.buffer();
    return JSON.parse(packageJsonContents.toString());
  }

  // package.json not found.
  return null;
};

const scanFunction = async (functionName) => {
  const response = await client.getFunction({ FunctionName: functionName });

  const funcDir = join(tempDir, functionName);
  const zipPath = join(funcDir, "code.zip");
  try {
    await mkdir(funcDir, { recursive: true });
    await downloadFile(response.Code.Location, zipPath);
    const packageJson = await getPackageJsonContents(zipPath, funcDir);

    if (packageJson === null) {
      console.log(`${JS_SDK_V2_MARKER.NA} ${functionName}`);
      return;
    }

    const deps = packageJson.dependencies || {};
    const marker = Object.keys(deps).includes("aws-sdk")
      ? JS_SDK_V2_MARKER.Y
      : JS_SDK_V2_MARKER.N;
    console.log(`${marker} ${functionName}`);
  } finally {
    await rm(funcDir, { recursive: true, force: true });
  }
};

const response = await client.listFunctions();
const functions = response.Functions.map((f) => f.FunctionName);

const listFunctionsLength = functions.length;
if (listFunctionsLength === 0) {
  console.log("No functions found.");
  process.exit(0);
}

if (listFunctionsLength >= LAMBDA_LIST_FUNCTION_LIMIT) {
  functions.length = 0;

  const paginator = paginateListFunctions({ client }, {});
  for await (const page of paginator) {
    functions.push(...page.Functions.map((f) => f.FunctionName));
  }
}

const functionsLength = functions.length;
console.log(`Note about output:`);
console.log(
  `- ${JS_SDK_V2_MARKER.Y} means "aws-sdk" is found in package.json dependencies and migration is recommended.`
);
console.log(
  `- ${JS_SDK_V2_MARKER.N} means "aws-sdk" is not found in package.json dependencies.`
);
console.log(`- ${JS_SDK_V2_MARKER.NA} means package.json is not found.\n`);

console.log(
  `Reading ${functionsLength} function${functionsLength > 1 ? "s" : ""}.`
);

try {
  for (const functionName of functions) {
    await scanFunction(functionName);
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log("\nDone.");
