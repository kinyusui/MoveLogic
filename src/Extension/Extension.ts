import * as vscode from "vscode";
import { letQuickPickHandleInput, Retrieve } from "../Input";
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
  const waitForInput = new Promise((resolve: Retrieve) => {
    letQuickPickHandleInput(sourcePath, resolve);
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
      // await project.save();

      const moveLogic = configMoveLogic(sourcePath, newDirPath);
      moveLogic.moveDir();

      vscode.window.showInformationMessage(`Moved: ${sourcePath} → ${newDirPath}`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Error: ${err.message}`);
    }
  };
  return handleMove;
};

const handleMove = configHandleMove(promptWithSuggestions);

const configExtensionLogic = (logger: LoggerHandler) => {
  function activate(context: vscode.ExtensionContext) {
    logger.show();
    const disposable = vscode.commands.registerCommand("tsMoveHelper.move", handleMove);
    context.subscriptions.push(disposable);
  }

  function deactivate() {
    logger.dispose();
  }
  return {
    activate,
    deactivate,
  };
};

export const { activate, deactivate } = configExtensionLogic(rootLoggerHandler);
