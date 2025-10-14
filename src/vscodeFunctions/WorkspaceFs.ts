import * as path from "path";
import * as vscode from "vscode";

export const getWorkspaceRoot = () => {
  const projectFolderPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  return projectFolderPath ?? process.cwd();
};

export class WorkspaceFs {
  constructor(public workspaceRoot: string) {}
  resolve = (somePath: string) => {
    return path.resolve(this.workspaceRoot, somePath);
  };
}

export const configWorkspaceFs = () => {
  const workspaceRoot = getWorkspaceRoot();
  return new WorkspaceFs(workspaceRoot);
};
