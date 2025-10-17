import path from "path";
import { isRelative } from "../Jscodeshift/UpdateImports/UpdateNonMoveTargetImport.js";
import { Posixify, posixify } from "../Nonvscode/makePath.js";
import { configWorkspaceFs, WorkspaceFs } from "./WorkspaceFs.js";

export const shortAndPosixify = (filePath: string) => {
  const shortPath = path.normalize(filePath);
  return posixify(shortPath);
};

const makeRawRelativePath = (absBaseDirPath: string, otherFilePath: string) => {
  const filePath = path.relative(absBaseDirPath, otherFilePath);
  return isRelative(filePath) ? filePath : `./${filePath}`;
};

export class ImportPather {
  constructor(public workspaceFs: WorkspaceFs, public posixify: Posixify) {}
  resolve = (baseFilePath: string, relativePathFromBaseToElse: string) => {
    const { workspaceFs } = this;
    const absBaseFilePath = workspaceFs.resolve(baseFilePath);
    const absBaseDirPath = path.dirname(absBaseFilePath);
    return path.resolve(absBaseDirPath, relativePathFromBaseToElse);
  };

  relativeFromDir = (baseFilePath: string, otherFilePath: string) => {
    const relativePath = makeRawRelativePath(baseFilePath, otherFilePath);
    return this.posixify(relativePath);
  };

  relative = (baseFilePath: string, otherFilePath: string) => {
    const { workspaceFs } = this;
    const absBaseFilePath = workspaceFs.resolve(baseFilePath);
    const absBaseDirPath = path.dirname(absBaseFilePath);
    return this.relativeFromDir(absBaseDirPath, otherFilePath);
  };

  getAbsolutePathOfImport = (
    importPathInImporterFile: string,
    dirPathOfImporterFile: string
  ) => {
    return this.resolve(dirPathOfImporterFile, importPathInImporterFile);
  };

  dirname = path.dirname;
}

export const configImportPather = () => {
  const workspaceFs = configWorkspaceFs();
  return new ImportPather(workspaceFs, posixify);
};
