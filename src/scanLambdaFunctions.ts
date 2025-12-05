import {
  Lambda,
  paginateListFunctions,
  type FunctionConfiguration,
} from "@aws-sdk/client-lambda";

import { JS_SDK_V2_MARKER, LAMBDA_LIST_FUNCTIONS_LIMIT } from "./constants.ts";
import { scanLambdaFunction } from "./scanLambdaFunction.ts";

import { fileURLToPath } from "node:url";

const client = new Lambda();

const getNodeJsFunctionNames = (
  functions: FunctionConfiguration[] | undefined
) =>
  (functions ?? [])
    .filter((fn) => fn.Runtime?.startsWith("nodejs"))
    .map((fn) => fn.FunctionName)
    .filter((fnName): fnName is string => fnName !== undefined);

const getNodeJsFunctionNamesUsingPagination = async (client: Lambda) => {
  const functions: string[] = [];

  const paginator = paginateListFunctions({ client }, {});
  for await (const page of paginator) {
    functions.push(...getNodeJsFunctionNames(page.Functions));
  }

  return functions;
};

const scanLambdaFunctions = async () => {
  const response = await client.listFunctions();

  const listFunctionsLength = response.Functions?.length ?? 0;
  if (response.Functions?.length === 0) {
    console.log("No functions found.");
    process.exit(0);
  }

  const functions =
    listFunctionsLength >= LAMBDA_LIST_FUNCTIONS_LIMIT
      ? await getNodeJsFunctionNamesUsingPagination(client)
      : getNodeJsFunctionNames(response.Functions);

  const functionsLength = functions.length;
  console.log(`Note about output:`);
  console.log(
    `- ${JS_SDK_V2_MARKER.Y} means "aws-sdk" is found in package.json dependencies and migration is recommended.`
  );
  console.log(
    `- ${JS_SDK_V2_MARKER.N} means "aws-sdk" is not found in package.json dependencies.`
  );
  console.log(
    `- ${JS_SDK_V2_MARKER.UNKNOWN} means script was not able to proceed, and it emits reason.`
  );
  console.log(
    `- ${JS_SDK_V2_MARKER.FAIL} means failure when parsing package.json.\n`
  );

  console.log(
    `Reading ${functionsLength} function${functionsLength > 1 ? "s" : ""}.`
  );

  for (const functionName of functions) {
    await scanLambdaFunction(client, functionName);
  }

  console.log("\nDone.");
};

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  scanLambdaFunctions();
}
