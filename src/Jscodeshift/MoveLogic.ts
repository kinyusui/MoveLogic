import * as fs from "fs";
import * as path from "path";
import { configMakeNewPath, getFullPaths, MakeNewPath } from "../makePath";
import { RemoveEmptyDir } from "../RemoveEmptyDir";
import { updateImports, UpdateImports } from "./UpdateImports/UpdateImports";

const makePathPossible = (filePath: string) => {
  const dirPath = path.dirname(filePath);
  const dirMissing = !fs.existsSync(dirPath);
  if (dirMissing) {
    makePathPossible(dirPath);
    fs.mkdirSync(dirPath);
  }
};

type Props = {
  oldDirPath: string;
  makeNewPath: MakeNewPath;
  removeDirer: RemoveEmptyDir;
  updateImports: UpdateImports;
};

export class MoveLogic {
  constructor(public props: Props) {}

  moveFile = async (sourceFile: string) => {
    // Normalize paths
    const { makeNewPath, updateImports } = this.props;
    const moveTargetPath: string = path.normalize(sourceFile);
    const endFilePath = makeNewPath(sourceFile);
    makePathPossible(endFilePath);
    await fs.promises.rename(moveTargetPath, endFilePath);
    await updateImports(moveTargetPath, endFilePath);
  };

  _moveDir = async (oldDirPath: string) => {
    const filePaths = getFullPaths(oldDirPath);
    for (const filePath of filePaths) {
      await this.moveFile(filePath);
    }
  };

  moveDir = async () => {
    const { oldDirPath, removeDirer } = this.props;
    await this._moveDir(oldDirPath);
    await removeDirer.removeEmptyDir(oldDirPath);
  };
}
type Config = {
  oldDirPath: string;
  newDirPath: string;
};
export const configMoveLogic = ({ oldDirPath, newDirPath }: Config) => {
  const removeDirer = new RemoveEmptyDir();
  const makeNewPath = configMakeNewPath(oldDirPath, newDirPath);
  return new MoveLogic({ oldDirPath, makeNewPath, removeDirer, updateImports });
};
