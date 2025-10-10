import typescript from "rollup-plugin-typescript2";
import webWorkerLoader from "rollup-plugin-web-worker-loader";
import terser from "@rollup/plugin-terser";

const isProd = process.env.NODE_ENV === 'production';

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/webx-client.esm.js",
      format: "esm",
      sourcemap: !isProd,
    },
    {
      file: "dist/webx-client.cjs",
      format: "cjs",
      sourcemap: !isProd
    }
  ],
  external: ['three', '@tweenjs/tween.js'],
  plugins: [
    webWorkerLoader({
      inline: true,
      targetPlatform: "browser",
      extensions: [".ts", ".js"],
      sourcemap: !isProd,
    }),
    typescript({
      useTsconfigDeclarationDir: true,
      sourceMap: !isProd,
      inlineSource: !isProd,
    }),
    ...(isProd ? [terser()] : [])
  ]
};
