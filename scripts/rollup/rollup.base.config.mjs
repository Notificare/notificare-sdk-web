import tsc from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import svg from 'rollup-plugin-svg-import';
import emitModulePackageFile from './plugins/rollup-emit-module-package-file.mjs';

export function build(pkg, options) {
  const { typescript } = options;

  const dependencies = [...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })];

  /**
   * CommonJS builds
   */
  const commonJsBuildPlugins = [
    tsc({
      typescript: typescript,
      target: 'ES6',
      // noEmitOnError: true,
    }),
    json(),
    svg(),
  ];

  const commonJsBuilds = [
    {
      input: 'src/index.ts',
      output: [
        {
          file: pkg.main,
          format: 'cjs',
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
          format: 'cjs',
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
      target: 'es2017',
      // noEmitOnError: true,
    }),
    json({ preferConst: true }),
    svg(),
  ];

  const esmBuilds = [
    {
      input: 'src/index.ts',
      output: [
        {
          file: pkg.browser,
          format: 'es',
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
          format: 'es',
          sourcemap: true,
        },
      ],
      external: (dependency) => dependencies.some((d) => dependency === d),
      plugins: [...esmBuildPlugins, emitModulePackageFile()],
    })),
  ];

  return [...commonJsBuilds, ...esmBuilds];
}
