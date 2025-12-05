import unzipper from "unzipper";
const PACKAGE_JSON_FILENAME = "package.json";

export const getPackageJsonContents = async (zipPath: string) => {
  const directory = await unzipper.Open.file(zipPath);
  const packageJsonContents = [];

  for (const file of directory.files) {
    // Skip 'node_modules' directory, as it's not the customer source code.
    if (file.path.includes("node_modules/")) continue;

    // Skip anything which is not `package.json`
    if (!file.path.endsWith(PACKAGE_JSON_FILENAME)) continue;

    const packageJsonContent = await file.buffer();
    packageJsonContents.push(packageJsonContent.toString());
  }

  return packageJsonContents;
};
