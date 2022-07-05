import merge from "deepmerge";
import { createBasicConfig } from "@open-wc/building-rollup";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
const baseConfig = createBasicConfig();

export default merge(baseConfig, {
  input: "./dist/index.js",
  output: {
    dir: "build",
    format: "cjs",
    sourcemap: true,
    entryFileNames: "[name].min.js",
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      // preferBuiltins: true,
      browser: true,
    }),
    json(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
    }),
  ],
});
