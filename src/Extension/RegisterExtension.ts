import * as vscode from "vscode";
import { LoggerHandler } from "../Logger";
import { configExtension } from "./Extension";
import { rootLoggerHandler } from "./Logger";

const configExtensionLogic = (logger: LoggerHandler) => {
  function activate(context: vscode.ExtensionContext) {
    const extension = configExtension();
    extension.register(context);
    logger.show();
    // registerQuickPickCommands(context);
  }

  function deactivate() {
    logger.dispose();
  }
  return {
    activate,
    deactivate,
  };
};
// in your extension.ts or a dedicated commands file
// --- COMMAND REGISTRATION ---
// This should be called from your extension's `activate` function.

export const { activate, deactivate } = configExtensionLogic(rootLoggerHandler);
