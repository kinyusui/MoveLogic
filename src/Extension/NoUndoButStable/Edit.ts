import fs from "fs-extra";
import path from "path";
import {
  updateImports,
  UpdateImports,
} from "../../Jscodeshift/UpdateImports/UpdateImports.js";
import { CheckIsTargetFile, checkIsTsLike } from "../../Nonvscode/makePath.js";
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
  checkIsTsLike: CheckIsTargetFile;
};

export class Editor implements EditorFunctions {
  constructor(public props: Props) {}
  deleteFile = RemoveLogic.deleteFile;
  removeEmptyDir = this.props.removeLogic.removeEmptyDir;

  createNewFile = async (startPath: string, endPath: string) => {
    const isTsLike = this.props.checkIsTsLike(startPath);
    if (isTsLike) {
      await fs.createFile(endPath);
      await this.props.updateImports(startPath, endPath);
    } else {
      await fs.copyFile(startPath, endPath);
    }
  };

  renameFile = async (startPath: string, endPath: string) => {
    await this.createNewFile(startPath, endPath);
    await fs.remove(startPath);
  };
}

export const configStableEdit = () => {
  const removeLogic = configRemoveLogic();
  return new Editor({
    updateImports: updateImports,
    removeLogic: removeLogic,
    checkIsTsLike: checkIsTsLike,
  });
};
