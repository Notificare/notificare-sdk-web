import typescript from 'typescript';
import { build } from '../../scripts/rollup/rollup.base.config.mjs';
import pkg from './package.json' assert { type: 'json' };

export default build(pkg, { typescript });
