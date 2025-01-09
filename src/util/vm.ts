import core from "@actions/core";
import vm, { type Context } from "node:vm";

export const runScript = (code?: string | null, sandbox?: Context) => {
  const script = new vm.Script(code ?? "const __empty__ = true");
  const context = vm.createContext(sandbox);

  try {
    return script.runInContext(context);
  } catch (error) {
    core.debug(`Error running script: ${error}`);
  }
};
