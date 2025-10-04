import * as fs from "fs-extra";
import path from "path";

export class RemoveEmptyDir {
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
    if (subPaths.length === 0) {
      await fs.rmdir(dirPath);
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
