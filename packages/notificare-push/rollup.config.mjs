import typescript from "typescript";
import { build } from "@notificare/rollup";
import pkg from "./package.json" assert { type: "json" };

export default build(pkg, {
  typescript,
  extraBuilds: {
    cjs: [
      {
        input: 'src/sw/index.ts',
        output: pkg['sw-main'],
      },
    ],
    esm: [
      {
        input: 'src/sw/index.ts',
        output: pkg['sw-browser'],
      },
    ],
  }
});
