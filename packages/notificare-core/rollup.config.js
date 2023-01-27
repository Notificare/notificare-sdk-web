import typescript from 'typescript';
import typescriptPlugin from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: 'json' };

const dependencies = [...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })];

/**
 * ESM builds
 */
const esmBuilds = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.esm5,
        format: 'es',
        sourcemap: true,
      },
    ],
    external: (dependency) => dependencies.some((d) => dependency === d),
    plugins: [
      typescriptPlugin({
        typescript,
        target: 'es5',
      }),
      json(),
      // --> used for replacing strings in code based on the running build.
      // replace(generateBuildTargetReplaceConfig('esm', 5)),
      // emitModulePackageFile()
    ],
  },
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
    plugins: [
      typescriptPlugin({
        typescript,
        target: 'es2017',
      }),
      json({ preferConst: true }),
      // --> used for replacing strings in code based on the running build.
      // replace(generateBuildTargetReplaceConfig('esm', 2017)),
      // emitModulePackageFile()
    ],
  },
];

/**
 * CommonJS builds
 */
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
    plugins: [
      typescriptPlugin({
        typescript,
        target: 'es5',
      }),
      json(),
      // --> used for replacing strings in code based on the running build.
      // replace(generateBuildTargetReplaceConfig('cjs', 5)),
    ],
  },
];

export default [...esmBuilds, ...commonJsBuilds];
