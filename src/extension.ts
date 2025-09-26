import * as vscode from "vscode";
import { configMoveLogic } from "./MoveLogic";
import { makeProject } from "./Project";

// async function moveWithTsMorph(project: Project, source: string, target: string) {
//   // naive: physical move
//   await fs.move(source, target, { overwrite: true });

//   // update imports via ts-morph
//   const sourceFile = project.getSourceFile(source);
//   if (sourceFile) {
//     sourceFile.move(target); // ts-morph updates imports
//   }
// }


export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "tsMoveHelper.move",
    async (uri: vscode.Uri) => {
      try {
        const sourcePath = uri.fsPath;

        // Prompt for new path, default is current
        const newPath = await vscode.window.showInputBox({
          prompt: "Enter new path for file/folder",
          value: sourcePath
        });
        if (!newPath || newPath === sourcePath) {
          return;
        }

        const project = makeProject(uri);
        if (!project) return;

        const moveLogic = configMoveLogic({ project: project, log: true });
        moveLogic.moveDir(sourcePath, newPath);
        await project.save();

        vscode.window.showInformationMessage(`Moved: ${sourcePath} → ${newPath}`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Error: ${err.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}


export function deactivate() {}
