import { Uri } from "vscode";
import { vscode } from "../Nonvscode/MakeDependencyEasy";

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

const makeFileTruth = async (uri: Uri, fileType: vscode.FileType) => {
  const stat = await vscodeFs.stat(uri);
  return stat.type === fileType;
};

const makeIsFile = async (uri: Uri) => {
  return await makeFileTruth(uri, vscode.FileType.File);
};

type RecordUri = Record<string, Uri>;
type UriInfos = [string, vscode.FileType][];
const getAllUriFromDir = async (dirUri: Uri): Promise<RecordUri> => {
  let recordUri: RecordUri = {};
  const needsWork = await vscode.workspace.fs.readDirectory(dirUri);
  for (const [name, type] of needsWork) {
    const isFile = type === vscode.FileType.File;
    const subUri = vscode.Uri.joinPath(dirUri, name);
    if (isFile) {
      recordUri[subUri.fsPath] = subUri;
    } else {
      const subRecordUri = await getAllUriFromDir(subUri);
      recordUri = Object.assign(recordUri, subRecordUri) as RecordUri;
    }
  }
  return recordUri;
};

const getAllUri = async (uri: Uri) => {
  const isFile = await makeIsFile(uri);
  if (isFile) {
  }
};

async function doSomething() {
  console.log("Hello");
  return 42; // No 'await' here
}

export class MyFs {
  constructor() {}
  static rename = rename;
  static delete = myDelete;
}
