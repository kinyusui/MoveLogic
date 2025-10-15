import fs from "fs-extra";
import path from "path";
import { vscode } from "../../Nonvscode/MakeDependencyEasy";
import { MyFs } from "../MyFS";

export const makePathPossible = (filePath: string) => {
  const dirPath = path.dirname(filePath);
  const dirMissing = !fs.existsSync(dirPath);
  if (dirMissing) {
    makePathPossible(dirPath);
    fs.mkdirSync(dirPath);
  }
};
export type MakePathPossible = typeof makePathPossible;

type Props = {
  editor: vscode.WorkspaceEdit;
};

export class Editor {
  constructor(public props: Props) {}
  renameFile = async (startPath: string, endPath: string) => {
    await MyFs.rename(startPath, endPath);

    // await this.applyEdit();
  };

  // createFile = (filePath: string) => {
  //   const uri = makeUri(filePath);
  //   this.props.editor.createFile(uri);
  //   // await this.applyEdit();
  // };

  // rewrite = async (filePath: string, newContent: string) => {
  //   const fileUri = makeUri(filePath);
  //   const document = await vscode.workspace.openTextDocument(fileUri);
  //   const firstLine = document.lineAt(0);
  //   const lastLine = document.lineAt(document.lineCount - 1);
  //   const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
  //   this.props.editor.replace(document.uri, fullRange, newContent);
  //   // await this.applyEdit();
  // };

  // writeFile = async (filePath: string, newContent: string) => {
  //   this.createFile(filePath);
  //   await this.rewrite(filePath, newContent);
  // };

  deleteFile = async (filePath: string) => {
    // const fileUri = makeUri(filePath);
    // this.props.editor.deleteFile(fileUri);
    await MyFs.delete(filePath);
    // await this.applyEdit();
  };

  applyEdit = async () => {};
}

export const configUndoableEdit = () => {
  const editor = new vscode.WorkspaceEdit();
  return new Editor({
    editor,
  });
};
