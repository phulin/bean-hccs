/* eslint-env node */
import { build, context } from "esbuild";
import babel from "esbuild-plugin-babel";
import process from "process";

const args = process.argv.slice(2);

const doWatch = args.some((a) => a === "--watch" || a === "-w");

const watchPlugin = {
  name: "watch",
  setup(build) {
    build.onEnd((result) => {
      const date = new Date();
      console.log(
        `[${date.toTimeString()}] Build ${result.errors.length ? "failed" : "succeeded"}.`
      );
    });
  },
};

const config = {
  entryPoints: {
    hccs: "./src/index.ts",
    hccs_combat: "./src/combat.ts",
    hccs_pre: "./src/pre.ts",
    hccs_ascend: "./src/ascend.ts",
    loop: "./src/loop.ts",
    loop_chrono: "./src/loop-chrono.ts",
    nepreset: "./src/nep.ts",
  },
  bundle: true,
  minifySyntax: true,
  platform: "node",
  target: "rhino1.7.14",
  external: ["kolmafia"],
  plugins: [babel(), watchPlugin],
  outdir: "KoLmafia/scripts/bean-hccs/",
  loader: { ".json": "text" },
  inject: ["./kolmafia-polyfill.js"],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
};

if (doWatch) {
  const ctx = await context(config);
  await ctx.watch();
} else {
  await build(config);
}
