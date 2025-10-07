import typescript from "rollup-plugin-typescript2";
import webWorkerLoader from "rollup-plugin-web-worker-loader";
import copy from 'rollup-plugin-copy';

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/webx-client.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/webx-client.cjs",
      format: "cjs",
      sourcemap: true
    }
  ],
  external: ['three', '@tweenjs/tween.js'],
  plugins: [
    webWorkerLoader({
      inline: true,
      targetPlatform: "browser"
    }),
    typescript({
      useTsconfigDeclarationDir: true,
      sourceMap: true,
      inlineSource: true,
    }),
    copy({
      targets: [
        { src: "src/input/GuacamoleKeyboard.js", dest: "dist" }
      ]
    })
  ]
};
