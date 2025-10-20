import { fs, vscode } from "./MakeDependencyEasy.js";

export const vscodeFs = vscode.workspace.fs;

export const makeUri = (filePath: string) => vscode.Uri.file(filePath);

const rename = async function (startPath: string, endPath: string) {
  const startUri = makeUri(startPath);
  const endUri = makeUri(endPath);
  return await vscodeFs.rename(startUri, endUri);
};

const myDelete = async function (filePath: string) {
  const fileUri = makeUri(filePath);
  await vscodeFs.delete(fileUri);
};

export class MyFs {
  constructor() {}
  static rename = rename;
  static delete = myDelete;
  static existSync = fs.existsSync;
}
