import { JS_SDK_V2 } from "../constants.ts";

const SDK_V2_REGEX_PATTERNS = [
  // 1. CommonJS require (Webpack, Browserify, Parcel)
  new RegExp(`require\\s*\\(\\s*['"\`]${JS_SDK_V2}['"\`]\\s*\\)`, "g"),

  // 2. ES6 import statements
  new RegExp(`import\\s+.*?from\\s+['"\`]${JS_SDK_V2}['"\`]`, "g"),
  new RegExp(`import\\s*\\(\\s*['"\`]${JS_SDK_V2}['"\`]\\s*\\)`, "g"),

  // 3. Webpack-style module definitions
  new RegExp(`['"\`]${JS_SDK_V2}['"\`]\\s*:\\s*function`, "g"),

  // 4. AMD/RequireJS (sometimes used by bundlers)
  new RegExp(`define\\s*\\([^)]*['"\`]${JS_SDK_V2}['"\`]`, "g"),

  // 5. Export statements
  new RegExp(`export\\s+.*?from\\s+['"\`]${JS_SDK_V2}['"\`]`, "g"),

  // 6. Dynamic imports with template literals
  new RegExp(`import\\s*\\(\\s*\`${JS_SDK_V2}\`\\s*\\)`, "g"),

  // 7. Webpack module map (numeric IDs)
  new RegExp(`/\\*!?\\s*${JS_SDK_V2}\\s*\\*/`, "g"),

  // 8. UMD pattern
  new RegExp(
    `['"\`]${JS_SDK_V2}['"\`]\\s*,\\s*\\w+\\[['"\`]${JS_SDK_V2}['"\`]\\]`,
    "g"
  ),

  // 9. System.register format (SystemJS)
  new RegExp(`System\\.register\\s*\\([^)]*['"\`]${JS_SDK_V2}['"\`]`, "g"),

  // 10. Rollup/esbuild style with quotes in object keys
  new RegExp(`['"\`]${JS_SDK_V2}['"\`]\\s*:\\s*\\{`, "g"),
];

export const hasSdkV2InBundle = (bundleContent: string): boolean => {
  for (const SDK_V2_REGEX_PATTERN of SDK_V2_REGEX_PATTERNS) {
    const matches = bundleContent.match(SDK_V2_REGEX_PATTERN);
    if (matches && matches.length > 0) {
      return true;
    }
  }

  return false;
};
