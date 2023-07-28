import typescript from 'typescript';
import { buildUmbrella } from '@notificare/rollup';
import pkg from './package.json' assert { type: 'json' };

export default buildUmbrella(pkg, { typescript, rootDirectory: import.meta.url });
