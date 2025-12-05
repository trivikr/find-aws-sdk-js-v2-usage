import { JS_SDK_V2_MARKER } from "./constants.js";
import { downloadFile } from "./utils/downloadFile.js";
import { getPackageJsonContents } from "./utils/getPackageJsonContents.js";

import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tempDir = await mkdtemp(join(tmpdir(), "lambda-scan-"));

export const scanLambdaFunction = async (client, functionName) => {
  const response = await client.getFunction({ FunctionName: functionName });

  const funcDir = join(tempDir, functionName);
  const zipPath = join(funcDir, "code.zip");
  try {
    await mkdir(funcDir, { recursive: true });
    await downloadFile(response.Code.Location, zipPath);
    const packageJsonContents = await getPackageJsonContents(zipPath);

    if (packageJsonContents.length === 0) {
      console.log(`${JS_SDK_V2_MARKER.UNKNOWN} ${functionName}`);
      return;
    }

    for (const packageJsonContent of packageJsonContents) {
      try {
        const packageJson = JSON.parse(packageJsonContent);
        const dependencies = packageJson.dependencies || {};
        if ("aws-sdk" in dependencies) {
          console.log(`${JS_SDK_V2_MARKER.Y} ${functionName}`);
          return;
        }
      } catch (error) {
        console.log(`${JS_SDK_V2_MARKER.FAIL} ${functionName}`);
        return;
      }
    }

    console.log(`${JS_SDK_V2_MARKER.N} ${functionName}`);
  } finally {
    await rm(funcDir, { recursive: true, force: true });
  }
};
