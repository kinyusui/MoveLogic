import fs from "fs";
import { configImportPather, ImportPather } from "../../Nonvscode/ImportPather.js";
import { removeTsTypesFrom } from "../../Nonvscode/makePath.js";
import { rootWorkspaceFs } from "../../vscodeFunctions/WorkspaceFs.js";
import { FilePath, ImportPath } from "./ImportPath.js";
import { UpdateImport, updatePathUsingUpdater } from "./UpdatePathUsingUpdater.js";

const removeExtension = removeTsTypesFrom.fullFilePath;

export const isRelative = (filePath: string) => filePath.startsWith(".");

export class UpdateNonMoveTargetImport {
  updateOccurred: boolean;
  constructor(
    public moveTargetPath: FilePath,
    public newPath: FilePath,
    public importPather: ImportPather,
  ) {
    this.updateOccurred = false;
  }

  static isMoveTargetAnImport = (
    moveTargetPath: string,
    importPathInFile: string,
    dirOfFileWithImport: string,
  ) => {
    const absMoveTargetPath = rootWorkspaceFs.resolve(moveTargetPath);
    const absImportPath = rootWorkspaceFs.resolve(
      dirOfFileWithImport,
      importPathInFile,
    );

    const moveTargetNoExt = removeExtension(absMoveTargetPath);
    const importPathNoExt = removeExtension(absImportPath);
    const match = moveTargetNoExt === importPathNoExt;
    return match;
  };

  updateImport: UpdateImport = (startDirPath: string, importPathInfo: ImportPath) => {
    const importPath: string = importPathInfo.path;
    if (!isRelative(importPath)) return; // Skip non-relative imports

    const { moveTargetPath, newPath } = this;
    const affectedByMove = UpdateNonMoveTargetImport.isMoveTargetAnImport(
      moveTargetPath,
      importPath,
      startDirPath,
    );
    if (affectedByMove) {
      const { relativeFromDir } = this.importPather;
      importPathInfo.path = relativeFromDir(startDirPath, newPath);
      this.updateOccurred = true;
    }
  };

  updateFile = (filePath: string) => {
    const fileMissing = !fs.existsSync(filePath);
    if (fileMissing) return;

    const { updateImport, importPather } = this;
    const { ast } = updatePathUsingUpdater(filePath, updateImport, importPather);
    if (this.updateOccurred) fs.writeFileSync(filePath, ast.toSource());

    this.updateOccurred = false; // reset for next run.
  };
}

export const configUpdateNonMoveTargetImport = (
  moveTargetPath: FilePath,
  newPath: FilePath,
) => {
  [moveTargetPath, newPath] = [moveTargetPath, newPath].map(removeExtension);
  const importPather = configImportPather();
  return new UpdateNonMoveTargetImport(moveTargetPath, newPath, importPather);
};
