import unzipper from "unzipper";
const PACKAGE_JSON_FILENAME = "package.json";

export type LambdaFunctionContents = {
  /**
   * String contents of all package.json files from Lambda Function.
   */
  packageJsonContents?: string[];

  /**
   * String contents of the bundle, if there's a single file.
   */
  bundleContent?: string;
};

export const getLambdaFunctionContents = async (
  zipPath: string
): Promise<LambdaFunctionContents> => {
  const directory = await unzipper.Open.file(zipPath);

  const files = directory.files.filter((f) => f.type === "File");
  if (files.length === 1) {
    // Lambda function contains a single bundle. Return it.
    const file = files[0];
    const bundleContent = await file.buffer();
    return { bundleContent: bundleContent.toString() };
  }

  const packageJsonContents = [];

  for (const file of directory.files) {
    // Skip 'node_modules' directory, as it's not the customer source code.
    if (file.path.includes("node_modules/")) continue;

    // Skip anything which is not `package.json`
    if (!file.path.endsWith(PACKAGE_JSON_FILENAME)) continue;

    const packageJsonContent = await file.buffer();
    packageJsonContents.push(packageJsonContent.toString());
  }

  return { packageJsonContents };
};
