import { join } from "node:path";
import TerserPlugin from "terser-webpack-plugin";

const outputPath = join(import.meta.dirname, "src", "utils", "__fixtures__");

export default {
  output: {
    path: outputPath,
    libraryTarget: "commonjs2",
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};
