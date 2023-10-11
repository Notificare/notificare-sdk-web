import typescript from 'typescript';
import { build } from '@notificare/rollup';
import pkg from './package.json' assert { type: 'json' };

export default build(pkg, { typescript });
