import typescriptPlugin from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { emitModulePackageFile } from "./plugins/emit-module-package-file.js";

export function build(pkg, typescript) {
  const dependencies = [
    ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  ];

  /**
   * CommonJS builds
   */
  const commonJsBuilds = [
    {
      input: "src/index.ts",
      output: [
        {
          file: pkg.main,
          format: "cjs",
          sourcemap: true,
        },
      ],
      external: (dependency) => dependencies.some((d) => dependency === d),
      plugins: [
        typescriptPlugin({
          typescript: typescript,
          target: "es5",
        }),
        json(),
      ],
    },
  ];

  /**
   * ESM builds
   */
  const esmBuilds = [
    // {
    //   input: "src/index.ts",
    //   output: [
    //     {
    //       file: pkg.esm5,
    //       format: "es",
    //       sourcemap: true,
    //     },
    //   ],
    //   external: (dependency) => dependencies.some((d) => dependency === d),
    //   plugins: [
    //     typescriptPlugin({
    //       target: "es5",
    //     }),
    //     json(),
    //     emitModulePackageFile(),
    //   ],
    // },
    {
      input: "src/index.ts",
      output: [
        {
          file: pkg.browser,
          format: "es",
          sourcemap: true,
        },
      ],
      external: (dependency) => dependencies.some((d) => dependency === d),
      plugins: [
        typescriptPlugin({
          typescript: typescript,
          target: "es2017",
        }),
        json({ preferConst: true }),
        emitModulePackageFile(),
      ],
    },
  ];

  return [...commonJsBuilds, ...esmBuilds];
}
