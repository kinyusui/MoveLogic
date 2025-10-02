import * as fs from "fs-extra";
import * as path from "path";
import { Project, ts } from "ts-morph";
import * as vscode from "vscode";

const getTsconfigPath = (uri: vscode.Uri) => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  const invalid = !workspaceFolder;
  if (invalid) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }

  const tsconfigPath = path.join(workspaceFolder.uri.fsPath, "tsconfig.json");
  const noFile = !fs.existsSync(tsconfigPath);
  if (noFile) {
    vscode.window.showErrorMessage("tsconfig.json not found in project root.");
    return;
  }
  return tsconfigPath;
};

export const makeProject = (uri: vscode.Uri) => {
  // Load tsconfig.json (closest to project root)
  const tsconfigPath = getTsconfigPath(uri);
  if (tsconfigPath === undefined) return;

  const project = new Project({
    tsConfigFilePath: tsconfigPath,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  return project;
};

/**
 * For test
 */
