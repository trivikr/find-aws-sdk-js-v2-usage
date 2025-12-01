import { Lambda } from "@aws-sdk/client-lambda";
import unzipper from "unzipper";

import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

const client = new Lambda();
const tempDir = await mkdtemp(join(tmpdir(), "lambda-scan-"));

const JS_TS_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
];

const downloadFile = async (url, outputPath) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  await writeFile(outputPath, response.body);
};

const grepFunction = async (extractDir) => {
  const { promise, resolve, reject } = Promise.withResolvers();

  const pattern = "(\"aws-sdk\"|\"aws-sdk/|'aws-sdk'|'aws-sdk/)";
  const grep = spawn("grep", ["-rnE", pattern, extractDir]);

  let output = "";
  grep.stdout.on("data", (data) => {
    const lines = data.toString().split("\n").slice(0, -1);
    for (const line of lines) {
      output += line.startsWith(extractDir)
        ? line.slice(extractDir.length)
        : line;
      output += "\n";
    }
  });
  grep.on("close", () => resolve({ stdout: output }));
  grep.on("error", (error) => reject(error));

  return promise;
};

const extractZip = async (zipPath, extractDir) => {
  const directory = await unzipper.Open.file(zipPath);

  for (const file of directory.files) {
    // Skip 'node_modules' directory, as it's not the customer source code.
    if (file.path.includes("node_modules/")) continue;

    const outputPath = join(extractDir, file.path);

    if (file.type === "Directory") {
      await mkdir(outputPath, { recursive: true });
    } else {
      // Skip if file is not JavaScript or TypeScript
      if (
        !JS_TS_EXTENSIONS.some((ext) => file.path.toLowerCase().endsWith(ext))
      )
        continue;

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, file.stream());
    }
  }
};

const scanFunction = async (index, functionName) => {
  const response = await client.getFunction({ FunctionName: functionName });

  const funcDir = join(tempDir, functionName.replace(/[^a-zA-Z0-9]/g, "_"));
  const zipPath = join(funcDir, "code.zip");
  const extractDir = join(funcDir, "extracted");
  try {
    await mkdir(extractDir, { recursive: true });
    await downloadFile(response.Code.Location, zipPath);
    await extractZip(zipPath, extractDir);

    const { stdout } = await grepFunction(extractDir);

    if (stdout) {
      const count = (stdout.match(/\n/g) || []).length;
      console.log(
        `${index}. Function '${functionName}' has ${count} aws-sdk references:`
      );
      for (const line of stdout.trim().split("\n")) {
        console.log(`- ${line}`);
      }
      console.log();
    } else {
      console.log(
        `${index}. Function '${functionName}' has no aws-sdk references.\n`
      );
    }
  } finally {
    await rm(funcDir, { recursive: true, force: true });
  }
};

const response = await client.listFunctions();
const functions = response.Functions.map((f) => f.FunctionName);

const numFunctions = functions.length;
if (numFunctions === 0) {
  console.log("No functions found.");
  process.exit(0);
}

console.log(
  `Reading ${numFunctions} function${numFunctions > 1 ? "s" : ""}.\n`
);

try {
  for (let i = 0; i < functions.length; i++) {
    await scanFunction(i + 1, functions[i]);
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log("Done.");
