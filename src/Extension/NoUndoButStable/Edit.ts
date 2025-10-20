import fs from "fs-extra";
import path from "path";
import {
  updateImports,
  UpdateImports,
} from "../../Jscodeshift/UpdateImports/UpdateImports.js";
import { checkIsTsLike } from "../../Nonvscode/makePath.js";
import { configRemoveLogic, RemoveLogic } from "../RemoveEmptyDir.js";
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
  removeLogic: RemoveLogic;
  updateImports: UpdateImports;
};

export class Editor implements EditorFunctions {
  constructor(public props: Props) {}
  deleteFile = RemoveLogic.deleteFile;
  removeEmptyDir = this.props.removeLogic.removeEmptyDir;

  createNewFile = async (startPath: string, endPath: string) => {
    const isTsLike = checkIsTsLike(startPath);
    if (isTsLike) {
      await fs.createFile(endPath);
      await this.props.updateImports(startPath, endPath);
    } else {
      await fs.copyFile(startPath, endPath);
    }
  };

  renameFile = async (startPath: string, endPath: string) => {
    // await MyFs.rename(startPath, endPath);
    // await fs.move(startPath, endPath, { overwrite: true });
    await this.createNewFile(startPath, endPath);
    await fs.remove(startPath);
    const startDir = path.dirname(startPath);
    await this.removeEmptyDir(startDir);
  };
}

export const configStableEdit = () => {
  const removeLogic = configRemoveLogic();
  return new Editor({
    updateImports: updateImports,
    removeLogic: removeLogic,
  });
};
