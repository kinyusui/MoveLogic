import { vscode } from "../MakeDependencyEasy";
import { makeUri } from "./MyFS";

type Props = {
  editor: vscode.WorkspaceEdit;
};

class UndoableEdit {
  constructor(public props: Props) {}
  rename = async (startPath: string, endPath: string) => {
    const startUri = makeUri(startPath);
    const endUri = makeUri(endPath);
    this.props.editor.renameFile(startUri, endUri);
  };

  myDelete = async (filePath: string) => {
    const fileUri = makeUri(filePath);
    this.props.editor.deleteFile(fileUri);
  };

  rewrite = async (filePath: string, newContent: string) => {
    const fileUri = makeUri(filePath);
    const document = await vscode.workspace.openTextDocument(fileUri);
    const firstLine = document.lineAt(0);
    const lastLine = document.lineAt(document.lineCount - 1);
    const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
    this.props.editor.replace(document.uri, fullRange, newContent);
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
