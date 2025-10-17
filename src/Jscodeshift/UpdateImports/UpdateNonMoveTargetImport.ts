import { fs } from "../../Nonvscode/MakeDependencyEasy.js";
import {
  configImportPather,
  ImportPather,
} from "../../vscodeFunctions/ImportPather.js";
import { rootWorkspaceFs } from "../../vscodeFunctions/WorkspaceFs.js";
import { removeExtension } from "../removeExtension.js";
import { ASTImportPath, FilePath, getFileInfo } from "./Helpers.js";

type UpdateImport = (startDirPath: string, importPathInfo: ASTImportPath) => void;
export const updatePathUsingUpdater = (
  startPath: string,
  updater: UpdateImport,
  importPather: ImportPather
) => {
  const { importPathInfos, root } = getFileInfo(startPath);
  const absFilePath = importPather.workspaceFs.resolve(startPath);
  const fileDirPath = importPather.dirname(absFilePath);
  importPathInfos.forEach((importPath: ASTImportPath) =>
    updater(fileDirPath, importPath)
  );
  return { importPathInfos, root };
};

export const isRelative = (filePath: string) => filePath.startsWith(".");

export class UpdateNonMoveTargetImport {
  updateOccurred: boolean;
  constructor(
    public moveTargetPath: FilePath,
    public newPath: FilePath,
    public importPather: ImportPather
  ) {
    this.updateOccurred = false;
  }

  static isMoveTargetAnImport = (
    moveTargetPath: string,
    importPathInFile: string,
    dirOfFileWithImport: string
  ) => {
    const absMoveTargetPath = rootWorkspaceFs.resolve(moveTargetPath);
    const absImportPath = rootWorkspaceFs.resolve(
      dirOfFileWithImport,
      importPathInFile
    );
    const moveTargetNoExt = removeExtension(absMoveTargetPath);
    const importPathNoExt = removeExtension(absImportPath);
    const match = moveTargetNoExt === importPathNoExt;
    return match;
  };

  updateImport = (startDirPath: string, importPathInfo: ASTImportPath) => {
    const sourceInfo = importPathInfo.node.source;
    const importPath: string = sourceInfo.value as string;
    if (!isRelative(importPath)) return; // Skip non-relative imports

    const { moveTargetPath, newPath } = this;
    const affectedByMove = UpdateNonMoveTargetImport.isMoveTargetAnImport(
      moveTargetPath,
      importPath,
      startDirPath
    );
    if (affectedByMove) {
      const { relativeFromDir } = this.importPather;
      sourceInfo.value = relativeFromDir(startDirPath, newPath);
      this.updateOccurred = true;
    }
  };

  updateFile = (filePath: string) => {
    const { updateImport, importPather } = this;
    const { root } = updatePathUsingUpdater(filePath, updateImport, importPather);
    if (this.updateOccurred) fs.writeFileSync(filePath, root.toSource());
  };
}

export const configUpdateNonMoveTargetImport = (
  moveTargetPath: FilePath,
  newPath: FilePath
) => {
  [moveTargetPath, newPath] = [moveTargetPath, newPath].map(removeExtension);
  const importPather = configImportPather();
  return new UpdateNonMoveTargetImport(moveTargetPath, newPath, importPather);
};
