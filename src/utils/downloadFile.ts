import { writeFile } from "node:fs/promises";

export const downloadFile = async (url: string, outputPath: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error(`Response body is null for URL ${url}`);
  }

  await writeFile(outputPath, response.body);
};
