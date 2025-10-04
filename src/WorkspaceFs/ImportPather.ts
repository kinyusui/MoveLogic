import * as path from "path";
import { posixify } from "../makePath";
import { WorkspaceFs } from "./WorkspaceFs";

export const shortAndPosixify = (filePath: string) => {
  const shortPath = path.normalize(filePath);
  return posixify(shortPath);
};
export class ImportPather {
  constructor(public workspaceFs: WorkspaceFs) {}
  resolve = (baseFilePath: string, relativePathFromBaseToElse: string) => {
    const { workspaceFs } = this;
    const absBaseFilePath = workspaceFs.resolve(baseFilePath);
    const absBaseDirPath = path.dirname(absBaseFilePath);
    return path.resolve(absBaseDirPath, relativePathFromBaseToElse);
  };
  relative = (baseFilePath: string, relativePathFromBaseToElse: string) => {
    const { workspaceFs } = this;
    const absBaseFilePath = workspaceFs.resolve(baseFilePath);
    const absBaseDirPath = path.dirname(absBaseFilePath);
    return path.relative(absBaseDirPath, relativePathFromBaseToElse);
  };

  getAbsolutePathOfImport = (
    importPathInImporterFile: string,
    dirPathOfImporterFile: string
  ) => {
    return this.resolve(dirPathOfImporterFile, importPathInImporterFile);
  };
}
