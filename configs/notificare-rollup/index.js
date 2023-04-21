import typescriptPlugin from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { emitModulePackageFile } from "./plugins/emit-module-package-file.js";

export function build(pkg, options) {
  const { typescript } = options;

  const dependencies = [
    ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  ];

  /**
   * CommonJS builds
   */
  const commonJsBuildPlugins = [
    typescriptPlugin({
      typescript: typescript,
      target: "es5",
      // noEmitOnError: true,
    }),
    json(),
  ];

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
      plugins: commonJsBuildPlugins,
    },
    ...(options.extraBuilds?.cjs ?? []).map((build) => ({
      input: build.input,
      output: [
        {
          file: build.output,
          format: "cjs",
          sourcemap: true,
        },
      ],
      external: (dependency) => dependencies.some((d) => dependency === d),
      plugins: commonJsBuildPlugins,
    })),
  ];

  /**
   * ESM builds
   */
  const esmBuildPlugins = [
    typescriptPlugin({
      typescript: typescript,
      target: "es2017",
      // noEmitOnError: true,
    }),
    json({ preferConst: true }),
  ];

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
      plugins: [...esmBuildPlugins, emitModulePackageFile()],
    },
    ...(options.extraBuilds?.esm ?? []).map((build) => ({
      input: build.input,
      output: [
        {
          file: build.output,
          format: "es",
          sourcemap: true,
        },
      ],
      external: (dependency) => dependencies.some((d) => dependency === d),
      plugins: [...esmBuildPlugins, emitModulePackageFile()],
    })),
  ];

  return [...commonJsBuilds, ...esmBuilds];
}
