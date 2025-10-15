import { vscode } from "../../Nonvscode/MakeDependencyEasy";
import { makeUri } from "../MyFS";
import { Editor } from "./Edit";

type Props = {
  editor: vscode.WorkspaceEdit;
};

export class UndoableEdit extends Editor {
  renameFile = async (startPath: string, endPath: string) => {
    const startUri = makeUri(startPath);
    const endUri = makeUri(endPath);
    await this.props.editor.renameFile(startUri, endUri);
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
    const fileUri = makeUri(filePath);
    this.props.editor.deleteFile(fileUri);
    // await this.applyEdit();
  };

  applyEdit = async () => {
    await vscode.workspace.applyEdit(this.props.editor);
  };
}

export const configUndoableEdit = () => {
  const editor = new vscode.WorkspaceEdit();
  return new UndoableEdit({
    editor,
  });
};

// export const rootUndoableEdit = configUndoableEdit();
