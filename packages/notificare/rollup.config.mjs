import typescript from 'typescript';
import pkg from './package.json' assert { type: 'json' };
import { build } from '../../scripts/rollup/rollup.umbrella.config.mjs';

export default build(pkg, { typescript, rootDirectory: import.meta.url });
