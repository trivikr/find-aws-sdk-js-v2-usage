import { JS_SDK_V2_MARKER } from "./constants.js";
import { downloadFile } from "./utils/downloadFile.js";
import { getPackageJsonContents } from "./utils/getPackageJsonContents.js";

import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const scanLambdaFunction = async (client, functionName) => {
  const response = await client.getFunction({ FunctionName: functionName });
  const zipPath = join(tmpdir(), `${functionName}.zip`);

  await downloadFile(response.Code.Location, zipPath);
  const packageJsonContents = await getPackageJsonContents(zipPath);
  await rm(zipPath);

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
