import { STS } from "@aws-sdk/client-sts";

const client = new STS();

export const handler = async () => client.getCallerIdentity();
