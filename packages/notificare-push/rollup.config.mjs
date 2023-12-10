import typescript from 'typescript';
import pkg from './package.json' assert { type: 'json' };
import { build } from '../../scripts/rollup/rollup.base.config.mjs';

export default build(pkg, { typescript });
