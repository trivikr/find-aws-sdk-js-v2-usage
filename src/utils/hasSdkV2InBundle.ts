import { JS_SDK_V2 } from "../constants.ts";

export const hasSdkV2InBundle = (bundleCode: string): boolean => {
  const patterns = [
    new RegExp(`node_modules/[^/]*${JS_SDK_V2}`, "g"),
    new RegExp(`["']${JS_SDK_V2}["']`, "g"),
  ];

  return patterns.some((pattern) => pattern.test(bundleCode));
};
