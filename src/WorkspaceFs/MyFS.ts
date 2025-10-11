import { vscode } from "../MakeDependencyEasy";

export const vscodeFs = vscode.workspace.fs;

export const makeUri = (filePath: string) => vscode.Uri.file(filePath);

const rename = async function (startPath: string, endPath: string) {
  // const edit = new vscode.WorkspaceEdit();

  const startUri = makeUri(startPath);
  const endUri = makeUri(endPath);
  return await vscodeFs.rename(startUri, endUri);
  // edit.renameFile(startUri, endUri);
  // await vscode.workspace.applyEdit(edit);
};

const myDelete = async function (filePath: string) {
  // const edit = new vscode.WorkspaceEdit();

  const fileUri = makeUri(filePath);
  await vscodeFs.delete(fileUri);
  // edit.deleteFile(fileUri);
  // await vscode.workspace.applyEdit(edit);
};

export class MyFs {
  constructor() {}
  static rename = rename;
  static delete = myDelete;
}
