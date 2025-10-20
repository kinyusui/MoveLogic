import { vscode } from "../../Nonvscode/MakeDependencyEasy.js";
import { makeUri } from "../../vscodeFunctions/MyFS.js";
import { EditorFunctions } from "./EditorFunctions.type.js";

type Props = {
  editor: vscode.WorkspaceEdit;
};

export class UndoableEdit implements EditorFunctions {
  constructor(public props: Props) {}
  renameFile = async (startPath: string, endPath: string) => {
    const startUri = makeUri(startPath);
    const endUri = makeUri(endPath);
    await this.props.editor.renameFile(startUri, endUri);
    // await this.applyEdit();
  };

  deleteFile = async (filePath: string) => {
    const fileUri = makeUri(filePath);
    this.props.editor.deleteFile(fileUri);
    // await this.applyEdit();
  };

  applyEdit = async () => {
    await vscode.workspace.applyEdit(this.props.editor);
  };

  removeEmptyDir = async (dirPath: string) => {};
}

export const configUndoableEdit = () => {
  const editor = new vscode.WorkspaceEdit();
  return new UndoableEdit({
    editor,
  });
};

// export const rootUndoableEdit = configUndoableEdit();
