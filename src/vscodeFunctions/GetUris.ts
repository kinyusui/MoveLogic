import { FileType, Uri } from "vscode";
import { vscode } from "./MakeDependencyEasy.js";
import { vscodeFs } from "./MyFS.js";

const makeFileTruth = async (uri: Uri, fileType: vscode.FileType) => {
  const stat = await vscodeFs.stat(uri);
  return stat.type === fileType;
};
const makeIsFile = async (uri: Uri) => {
  return await makeFileTruth(uri, vscode.FileType.File);
};

type UriInfos = [Uri, FileType][];
const getUrisFromDir = async (dirUri: Uri): Promise<UriInfos> => {
  const nameTypeInfos = await vscode.workspace.fs.readDirectory(dirUri);
  return nameTypeInfos.map(([name, type]) => {
    const subUri = vscode.Uri.joinPath(dirUri, name);
    return [subUri, type];
  });
};

type RecordUri = Record<string, Uri>;
const getAllUriFromDir = async (dirUri: Uri): Promise<RecordUri> => {
  let recordUri: RecordUri = {};
  const needsWork = await getUrisFromDir(dirUri);
  for (const [subUri, type] of needsWork) {
    const isFile = type === vscode.FileType.File;
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
  let recordUri: RecordUri = {};
  if (isFile) {
    recordUri[uri.fsPath] = uri;
  } else {
    recordUri = await getAllUriFromDir(uri);
  }
  return recordUri;
};
