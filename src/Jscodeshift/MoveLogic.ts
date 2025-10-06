import * as fs from "fs";
import * as path from "path";
import { configMakeNewPath, getFullPaths, MakeNewPath } from "../makePath";
import { RemoveEmptyDir } from "../RemoveEmptyDir";
import { updateImports } from "./UpdateImports/UpdateImports";

const makePathPossible = (filePath: string) => {
  const dirPath = path.dirname(filePath);
  const dirMissing = !fs.existsSync(dirPath);
  if (dirMissing) {
    makePathPossible(dirPath);
    fs.mkdirSync(dirPath);
  }
};

export class MoveLogic {
  constructor(
    public oldDirPath: string,
    public makeNewPath: MakeNewPath,
    public removeDirer: RemoveEmptyDir
  ) {}

  moveFile = async (sourceFile: string) => {
    // Normalize paths
    const moveTargetPath: string = path.normalize(sourceFile);
    const endFilePath = this.makeNewPath(sourceFile);
    makePathPossible(endFilePath);
    await fs.promises.rename(moveTargetPath, endFilePath);
    // rootLoggerHandler.logDebugMessage(`Moved ${moveTargetPath} to ${endFilePath}`);
    await updateImports(moveTargetPath, endFilePath);
  };

  _moveDir = async (oldDirPath: string) => {
    const filePaths = getFullPaths(oldDirPath);
    for (const filePath of filePaths) {
      await this.moveFile(filePath);
    }
  };

  moveDir = async () => {
    const { oldDirPath } = this;
    await this._moveDir(oldDirPath);
    await this.removeDirer.removeEmptyDir(oldDirPath);
    // rootLoggerHandler.logDebugMessage(`Done Moving Dir ${oldDirPath}`);
  };
}

export const configMoveLogic = (oldDirPath: string, newDirPath: string) => {
  const removeDirer = new RemoveEmptyDir();
  const makeNewPath = configMakeNewPath(oldDirPath, newDirPath);
  return new MoveLogic(oldDirPath, makeNewPath, removeDirer);
};
