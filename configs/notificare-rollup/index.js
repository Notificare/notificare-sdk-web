import tsc from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { emitModulePackageFile } from "./plugins/emit-module-package-file.js";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

export function build(pkg, options) {
  const { typescript } = options;

  const dependencies = [
    ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  ];

  /**
   * CommonJS builds
   */
  const commonJsBuildPlugins = [
    tsc({
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
    tsc({
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

export function buildUmbrella(pkg, options) {
  const { typescript, rootDirectory } = options;

  const externals = Object.keys(pkg.dependencies || {});
  const plugins = [nodeResolve(), commonjs(), json()];

  const typescriptPlugin = tsc({ typescript });
  const typescriptPluginCdn = tsc({
    typescript,
    declaration: false,
  });

  const componentBuilds = pkg.components
    // .filter((component) => component !== "core")
    .flatMap((component) => {
      const pkg = JSON.parse(
        readFileSync(new URL(`${component}/package.json`, rootDirectory))
      );

      return [
        {
          input: `${component}/index.ts`,
          output: [
            {
              file: resolve(component, pkg.browser),
              format: "es",
              sourcemap: true,
            },
          ],
          external: (dependency) => externals.some((d) => dependency === d),
          plugins: [...plugins, typescriptPlugin, emitModulePackageFile()],
        },
        {
          input: `${component}/index.ts`,
          output: [
            {
              file: resolve(component, pkg.main),
              format: "cjs",
              sourcemap: true,
            },
            {
              file: resolve(component, pkg.main.replace(".cjs.js", ".mjs")),
              format: "es",
              sourcemap: true,
            },
          ],
          external: (dependency) => externals.some((d) => dependency === d),
          plugins: [...plugins, typescriptPlugin],
        },
      ];
    });

  const cdnBuilds = [
    {
      input: "core/index.ts",
      output: {
        file: ".build/min/notificare-core.js",
        sourcemap: true,
        format: "es",
      },
      plugins: [...plugins, typescriptPluginCdn],
    },
    ...pkg.components
      .filter((component) => component !== "core")
      .map((component) => {
        const componentName = component.replace("/", "-");

        return {
          input: `${component}/index.ts`,
          output: {
            file: `.build/min/notificare-${componentName}.js`,
            sourcemap: true,
            format: "es",
          },
          plugins: [
            ...plugins,
            typescriptPluginCdn,
            terser({
              // keep_classnames: true,
              // keep_fnames: true,
              // mangle: false,
            }),
            replace,
          ],
          external: ["@notificare/web-core"],
        };
      }),
  ];

  return [...componentBuilds, ...cdnBuilds];
}
