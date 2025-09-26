import * as vscode from "vscode";
import { configMoveLogic } from "./MoveLogic";
import { makeProject } from "./Project";



const promptNewPath = async (sourcePath: string) => {
  return await vscode.window.showInputBox({
    prompt: "Enter new path for file/folder",
    value: sourcePath
  });
}

const handleMove = async (uri: vscode.Uri) => {
  try {
    const sourcePath = uri.fsPath;
    const newPath = await promptNewPath(sourcePath);
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

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "tsMoveHelper.move",
    handleMove
  );

  context.subscriptions.push(disposable);
}


export function deactivate() {}
