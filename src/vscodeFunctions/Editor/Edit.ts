import fs from "fs-extra";
import path from "path";
import {
  updateImports,
  UpdateImports,
} from "../../Jscodeshift/UpdateImports/UpdateImports.js";
import { MyFs } from "../MyFS.js";
import { EditorFunctions } from "./EditorFunctions.type.js";

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
  // editor: vscode.WorkspaceEdit;
  updateImports: UpdateImports;
};

export class Editor implements EditorFunctions {
  constructor(public props: Props) {}
  renameFile = async (startPath: string, endPath: string) => {
    await MyFs.rename(startPath, endPath);
    this.props.updateImports(startPath, endPath);
    // await this.applyEdit();
  };

  deleteFile = async (filePath: string) => {
    await MyFs.delete(filePath);
  };

  applyEdit = async () => {};
}

export const configStableEdit = () => {
  return new Editor({
    updateImports: updateImports,
  });
};
