import tsc from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import emitModulePackageFile from './plugins/rollup-emit-module-package-file.mjs';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

export function build(pkg, options) {
  const { typescript, rootDirectory } = options;

  const externals = Object.keys(pkg.dependencies || {});
  const plugins = [nodeResolve(), commonjs(), json()];

  const typescriptPluginCdn = tsc({
    typescript,
    declaration: false,
  });

  const componentBuilds = pkg.components.flatMap((component) => {
    const pkg = JSON.parse(readFileSync(new URL(`${component}/package.json`, rootDirectory)));

    return [
      {
        input: `${component}/index.ts`,
        output: [
          {
            file: resolve(component, pkg.browser),
            format: 'es',
            sourcemap: true,
          },
        ],
        external: (dependency) => externals.some((d) => dependency === d),
        plugins: [
          ...plugins,
          emitModulePackageFile(),
          tsc({
            typescript,
            declarationDir: dirname(resolve(component, pkg.browser)),
          }),
        ],
      },
      {
        input: `${component}/index.ts`,
        output: [
          {
            file: resolve(component, pkg.main),
            format: 'cjs',
            sourcemap: true,
          },
          {
            file: resolve(component, pkg.main.replace('.cjs.js', '.mjs')),
            format: 'es',
            sourcemap: true,
          },
        ],
        external: (dependency) => externals.some((d) => dependency === d),
        plugins: [
          ...plugins,
          tsc({
            typescript,
            declarationDir: dirname(resolve(component, pkg.main)),
          }),
        ],
      },
    ];
  });

  const cdnBuilds = pkg.components.map((component) => {
    const componentName = component.replace('/', '-');

    return {
      input: `${component}/index.ts`,
      output: {
        file: `.build/min/notificare-${componentName}.js`,
        sourcemap: true,
        format: 'es',
      },
      plugins: [
        ...plugins,
        typescriptPluginCdn,
        terser({
          // keep_classnames: true,
          // keep_fnames: true,
          // mangle: false,
        }),
      ],
      external: component === 'core' ? [] : ['@notificare/web-core'],
    };
  });

  return [...componentBuilds, ...cdnBuilds];
}
