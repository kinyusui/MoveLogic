import * as vscode from "vscode";
import { makeMyQuickPick, Resolve } from "../Input";
// import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { LoggerHandler } from "../Logger";
import { rootLoggerHandler } from "./Logger";

type WaitForInput = (sourcePath: string) => Promise<string | undefined>;
const promptNewPath: WaitForInput = async (sourcePath: string) => {
  return await vscode.window.showInputBox({
    prompt: "Enter new path for file/folder",
    value: sourcePath,
  });
};

const promptWithSuggestions: WaitForInput = async (sourcePath: string) => {
  const waitForInput = new Promise(async (resolve: Resolve) => {
    const quickPick = await makeMyQuickPick(sourcePath, resolve);
    // resolve(quickPick);
  });
  return await waitForInput;
};

const configHandleMove = (waitForInput: WaitForInput) => {
  const handleMove = async (uri: vscode.Uri) => {
    try {
      const sourcePath = uri.fsPath;
      const newDirPath = await waitForInput(sourcePath);
      if (!newDirPath || newDirPath === sourcePath) return;

      // const project = makeProject(uri);
      // if (!project) return;
      // const moveLogic = configMoveLogic({ project: project, log: true });
      // moveLogic.moveDir(sourcePath, newDirPath);
      //
      const moveLogic = configMoveLogic(sourcePath, newDirPath);
      moveLogic.moveDir();
      vscode.window.showInformationMessage(`Moved: ${sourcePath} → ${newDirPath}.`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Error: ${err.message}`);
    }
  };
  return handleMove;
};

const handleMove = configHandleMove(promptWithSuggestions);
export type QuickPickElement = vscode.QuickPick<vscode.QuickPickItem>;
class Extension {
  constructor(public quickPick: QuickPickElement) {}
}

const configExtensionLogic = (logger: LoggerHandler) => {
  function activate(context: vscode.ExtensionContext) {
    logger.show();
    const disposable = vscode.commands.registerCommand("tsMoveHelper.move", handleMove);
    context.subscriptions.push(disposable);

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
