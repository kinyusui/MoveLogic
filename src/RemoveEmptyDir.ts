import * as fs from "fs-extra";
import path from "path";
import { rootUndoableEdit, UndoableEdit } from "./WorkspaceFs/UndoableEdit";

type Props = {
  undoableEdit: UndoableEdit;
};

export class RemoveEmptyDir {
  constructor(public props: Props) {}
  getSubDirPaths = async (dirPath: string) => {
    const subNames = await fs.readdir(dirPath);
    const subPaths = subNames.map((subName) => path.join(dirPath, subName));
    const subDirPaths = subPaths.filter((subPath) => {
      const stat = fs.statSync(subPath);
      return stat.isDirectory();
    });
    return {
      subDirPaths: subDirPaths,
      subPaths: subPaths,
    };
    // const { fs } = vscode.workspace;
    // const dirUri = vscode.Uri.file(dirPath);
    // const subUris = await fs.readDirectory(dirUri);
    // subUris.filter((subUri) => subUri[1])
  };

  removeIfEmpty = async (dirPath: string) => {
    const { subDirPaths, subPaths } = await this.getSubDirPaths(dirPath);
    const { undoableEdit } = this.props;
    if (subPaths.length === 0) {
      await undoableEdit.deleteFile(dirPath);
    }
    return subDirPaths;
  };

  removeEmptyDir = async (dirPath: string) => {
    const subDirPaths = await this.removeIfEmpty(dirPath);
    if (subDirPaths.length === 0) return;

    for (const subDirPath of subDirPaths) {
      await this.removeEmptyDir(subDirPath);
    }

    await this.removeIfEmpty(dirPath);
  };
}

type Config = {
  undoableEdit: UndoableEdit;
};

export const configRemoveEmtpyDir = (config: Config | undefined = undefined) => {
  return new RemoveEmptyDir({
    undoableEdit: rootUndoableEdit,
  });
};
