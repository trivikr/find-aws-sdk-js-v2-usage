import { Lambda } from "@aws-sdk/client-lambda";
import extract from "extract-zip";

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const client = new Lambda();

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

const scanFunction = async (functionName, tempDir) => {
  let funcDir;
  try {
    const response = await client.getFunction({ FunctionName: functionName });

    funcDir = join(tempDir, functionName.replace(/[^a-zA-Z0-9]/g, "_"));
    const zipPath = join(funcDir, "code.zip");
    const extractDir = join(funcDir, "extracted");

    await mkdir(extractDir, { recursive: true });

    await downloadFile(response.Code.Location, zipPath);
    await extract(zipPath, { dir: extractDir });

    // Delete 'node_modules' directory, as it's not the source code customer owns
    await rm(join(extractDir, "node_modules"), {
      recursive: true,
      force: true,
    });

    const { stdout } = await grepFunction(extractDir);

    if (stdout) {
      const count = (stdout.match(/\n/g) || []).length;
      console.log("=".repeat(60));
      console.log(`Found ${count} aws-sdk references in '${functionName}':\n`);
      console.log(stdout.slice(0, -1));
      console.log("=".repeat(60));
      console.log();
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  } finally {
    await rm(funcDir, { recursive: true, force: true });
  }
};

const tempDir = await mkdtemp(join(tmpdir(), "lambda-scan-"));

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
  for (const func of functions) {
    await scanFunction(func, tempDir);
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log("Done.");
