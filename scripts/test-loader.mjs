import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);

// Exercise real TypeScript handlers with replaceable database/CAPTCHA boundaries.
export function load(file, mocks = {}, globals = {}) {
  const filename = resolve(root, file);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (id) => {
    if (id in mocks) return mocks[id];
    if (id.startsWith("@/")) return load(`${id.slice(2)}.ts`, mocks, globals);
    return require(id);
  };
  vm.runInNewContext(source, {
    module: loadedModule, exports: loadedModule.exports, require: localRequire,
    Request, Response, FormData, URL, console,
    process: { env: { TURNSTILE_SECRET_KEY: "test-secret" } },
    ...globals,
  }, { filename });
  return loadedModule.exports;
}
