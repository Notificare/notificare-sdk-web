import typescript from 'typescript';
import { build } from '../../scripts/rollup/rollup.umbrella.config.mjs';
import pkg from './package.json' assert { type: 'json' };

export default build(pkg, { typescript, rootDirectory: import.meta.url });
