import { join } from "node:path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";

const outputPath = join(import.meta.dirname, "src", "utils", "__fixtures__");

export default {
  target: "node",
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
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};
