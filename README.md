# find-aws-sdk-js-v2-usage

Scripts to help find resources which call AWS using JavaScript SDK v2

## Pre-requisites

- Install **Node.js** by following these steps:
  1. Install [nvm][].
  1. Use node v24.x.x by running `nvm use` or `nvm use 24` in a terminal window.
  1. Verify that node is installed by running `node -v` in a terminal window and confirm that it shows Node.js >=24, such as `v24.11.0`).
- Install dependencies by running `npm install`.
- Set up [SDK authentication with AWS][] with the required permissions for the task.
- Install [grep][] used for searching.

## JS SDK usage in AWS Lambda

This script requires AWS Managed Policy [AWSLambda_ReadOnlyAccess][].
It lists all Lambda functions, and performs download, unzip and scan for mentions of JS SDK v2.

Run `npm run scan:lambda` to find Lambda Functions which import JS SDK v2.

Example AWS account which has two functions, one using JS SDK v2 and another using JS SDK v3:

```console
$ aws lambda list-functions --query 'Functions[*].FunctionName'
[
    "function-which-imports-js-sdk-v2",
    "function-which-imports-js-sdk-v3"
]

$ npm run scan:lambda

...

Reading 2 functions.

1. Function 'function-which-imports-js-sdk-v2' has 3 aws-sdk references:
- /double-quotes.mjs:1:import AWS from "aws-sdk";
- /single-quotes.mjs:1:import AWS from 'aws-sdk';
- /deep-import.mjs:1:import DynamoDB from "aws-sdk/clients/dynamodb";

2. Function 'function-which-imports-js-sdk-v3' has no aws-sdk references.

Done.
```

[AWSLambda_ReadOnlyAccess]: https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSLambda_ReadOnlyAccess.html
[grep]: https://share.google/L1FAo8GuYlQI2sHwI
[nvm]: https://github.com/nvm-sh/nvm#installation-and-update
[SDK authentication with AWS]: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-your-credentials.html
