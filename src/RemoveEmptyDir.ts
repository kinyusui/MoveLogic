import * as fs from 'fs-extra';
import path from "path";

export class RemoveEmptyDir {
  getSubDirPaths = async (dirPath: string) => {
    const subName = await fs.readdir(dirPath);
    const subPaths = subName.map(subName => path.join(dirPath, subName));
    const subDirPaths = subPaths.filter((subPath) => {
      const stat = fs.statSync(subPath);
      return stat.isDirectory();
    });
    return subDirPaths;
    // const { fs } = vscode.workspace;
    // const dirUri = vscode.Uri.file(dirPath);
    // const subUris = await fs.readDirectory(dirUri);
    // subUris.filter((subUri) => subUri[1])
  }

  removeIfEmpty = async (dirPath: string) => {
    const subDirPaths = await this.getSubDirPaths(dirPath);
    if (subDirPaths.length === 0) {
      // await vscode.workspace.fs.delete(dirPath);
      await fs.emptyDir(dirPath);
      await fs.rmdir(dirPath);
    }
    return subDirPaths;
  }

  removeEmptyDir = async (dirPath: string) => {
    const subDirPaths = await this.removeIfEmpty(dirPath);
    if (subDirPaths.length === 0) return;

    subDirPaths.forEach((subDirPath) => {
      this.removeEmptyDir(subDirPath);
    })
    await this.removeIfEmpty(dirPath);
  }
}
