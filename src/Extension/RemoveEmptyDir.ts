import fs from "fs-extra";
import { path } from "../Nonvscode/MakeDependencyEasy.js";

export class RemoveLogic {
  constructor() {}
  static deleteFile = async (filePath: string) => {
    await fs.remove(filePath);
  };

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
  };

  removeIfEmpty = async (dirPath: string) => {
    const { subDirPaths, subPaths } = await this.getSubDirPaths(dirPath);

    if (subPaths.length === 0) {
      await RemoveLogic.deleteFile(dirPath);
    }
    return subDirPaths;
  };

  removeEmptyDir = async (dirPath: string) => {
    const subDirPaths = await this.removeIfEmpty(dirPath);
    const noBlockerNestedDirs = subDirPaths.length === 0;
    if (noBlockerNestedDirs) return;

    for (const subDirPath of subDirPaths) {
      await this.removeEmptyDir(subDirPath);
    }

    await this.removeIfEmpty(dirPath);
  };
}

export const configRemoveLogic = () => {
  return new RemoveLogic();
};
