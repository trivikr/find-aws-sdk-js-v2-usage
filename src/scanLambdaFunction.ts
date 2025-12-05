import type { Lambda } from "@aws-sdk/client-lambda";
import { JS_SDK_V2_MARKER } from "./constants.ts";
import { downloadFile } from "./utils/downloadFile.ts";
import { getPackageJsonContents } from "./utils/getPackageJsonContents.ts";

import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const scanLambdaFunction = async (
  client: Lambda,
  functionName: string
) => {
  const response = await client.getFunction({ FunctionName: functionName });
  const zipPath = join(tmpdir(), `${functionName}.zip`);

  let packageJsonContents;
  try {
    await downloadFile(response.Code!.Location!, zipPath);
    packageJsonContents = await getPackageJsonContents(zipPath);
  } finally {
    await rm(zipPath, { force: true });
  }

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
};
