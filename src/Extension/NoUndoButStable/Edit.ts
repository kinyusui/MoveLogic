import fs from "fs-extra";
import path from "path";
import {
  updateImports,
  UpdateImports,
} from "../../Jscodeshift/UpdateImports/UpdateImports.js";
import { EditorFunctions } from "../UndoableButBuggy/EditorFunctions.type.js";

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
  deleteFile = async (filePath: string) => {
    await fs.remove(filePath);
  };

  removeEmptyDir = async (dirPath: string) => {
    const subNames = await fs.readdir(dirPath);
    if (subNames.length === 0) {
      await this.deleteFile(dirPath);
    }
  };

  renameFile = async (startPath: string, endPath: string) => {
    // await MyFs.rename(startPath, endPath);
    // await fs.move(startPath, endPath, { overwrite: true });
    await fs.createFile(endPath);
    await this.props.updateImports(startPath, endPath);
    await fs.remove(startPath);
    const startDir = path.dirname(startPath);
    await this.removeEmptyDir(startDir);
  };
}

export const configStableEdit = () => {
  return new Editor({
    updateImports: updateImports,
  });
};
