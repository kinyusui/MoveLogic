import * as vscode from "vscode";
import { letQuickPickHandleInput, Retrieve } from "../Input";
import { LoggerHandler } from "../Logger";
import { configMoveLogic } from "../MoveLogic";
import { makeProject } from "../Project";
import { rootLoggerHandler } from "./Logger";


type WaitForInput = (sourcePath: string) => Promise<string | undefined>;
const promptNewPath: WaitForInput = async (sourcePath: string) => {
  return await vscode.window.showInputBox({
    prompt: "Enter new path for file/folder",
    value: sourcePath
  });
}

const promptWithSuggestions: WaitForInput = async (sourcePath: string) => {
  const waitForInput = new Promise((resolve: Retrieve) => {
    letQuickPickHandleInput(sourcePath, resolve);
  })
  return await waitForInput;
}


const configHandleMove = (waitForInput: WaitForInput) => {
  const handleMove = async (uri: vscode.Uri) => {
    try {
      const sourcePath = uri.fsPath;
      const newPath = await waitForInput(sourcePath);
      if (!newPath || newPath === sourcePath) return;
      const project = makeProject(uri);
      if (!project) return;

      const moveLogic = configMoveLogic({ project: project, log: true });
      moveLogic.moveDir(sourcePath, newPath);
      await project.save();

      vscode.window.showInformationMessage(`Moved: ${sourcePath} → ${newPath}`);
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
    const disposable = vscode.commands.registerCommand(
      "tsMoveHelper.move",
      handleMove
    );
    context.subscriptions.push(disposable);
  }


  function deactivate() {
    logger.dispose();
  }
  return {
    activate,
    deactivate
  }
}

export const { activate, deactivate } = configExtensionLogic(rootLoggerHandler);

