import { Lambda, paginateListFunctions } from "@aws-sdk/client-lambda";

import { JS_SDK_V2_MARKER, LAMBDA_LIST_FUNCTION_LIMIT } from "./constants.ts";
import { scanLambdaFunction } from "./scanLambdaFunction.ts";

import { fileURLToPath } from "node:url";

const client = new Lambda();

const scanLambdaFunctions = async () => {
  const response = await client.listFunctions();
  const functions = response.Functions!.map((f) => f.FunctionName);

  const listFunctionsLength = functions.length;
  if (listFunctionsLength === 0) {
    console.log("No functions found.");
    process.exit(0);
  }

  if (listFunctionsLength >= LAMBDA_LIST_FUNCTION_LIMIT) {
    functions.length = 0;

    const paginator = paginateListFunctions({ client }, {});
    for await (const page of paginator) {
      functions.push(...page.Functions!.map((f) => f.FunctionName));
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
  console.log(`- ${JS_SDK_V2_MARKER.UNKNOWN} means package.json is not found.`);
  console.log(
    `- ${JS_SDK_V2_MARKER.FAIL} means failure when parsing package.json.\n`
  );

  console.log(
    `Reading ${functionsLength} function${functionsLength > 1 ? "s" : ""}.`
  );

  for (const functionName of functions.filter((fn) => fn !== undefined)) {
    await scanLambdaFunction(client, functionName);
  }

  console.log("\nDone.");
};

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  scanLambdaFunctions();
}
