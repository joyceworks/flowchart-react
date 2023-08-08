import resolve from "@rollup/plugin-node-resolve";
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import jsx from "acorn-jsx";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.tsx",
  acornInjectPlugins: [jsx()],
  external: "react",
  plugins: [
    postcss({
      extensions: [".css"],
    }),
    resolve(),
    commonjs(),
    typescript({ jsx: "preserve" }),
    babel({
      presets: [["@babel/preset-react", { runtime: "automatic" }]],
      babelHelpers: "bundled",
      extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"],
    }),
    copy({
      targets: [{ src: "package.json", dest: "dist" }],
    }),
  ],
  output: {
    dir: "dist",
    format: "esm",
    plugins: [
      getBabelOutputPlugin({
        presets: ["@babel/preset-env"],
      }),
    ],
  },
};
