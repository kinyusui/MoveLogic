import * as fs from "fs";
import { configImportPather, ImportPather } from "../../WorkspaceFs/ImportPather";
import { removeExtension } from "../removeExtension";
import {
  ASTImportPath,
  getFileInfo,
  isMoveTargetAnImport,
  PathWithNoExtension,
} from "./Helpers";

type UpdateImport = (startDirPath: string, importPathInfo: ASTImportPath) => void;
export const updateImportsGeneral = (
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

export class UpdateNonMoveTargetImport {
  updateOccurred: boolean;
  constructor(
    public moveTargetPath: PathWithNoExtension,
    public newPath: PathWithNoExtension,
    public importPather: ImportPather
  ) {
    this.updateOccurred = false;
  }

  updateImport = (startDirPath: string, importPathInfo: ASTImportPath) => {
    const sourceInfo = importPathInfo.node.source;
    const importPath: string = sourceInfo.value as string;
    if (!importPath.startsWith(".")) return; // Skip non-relative imports

    const { moveTargetPath, newPath } = this;
    const affectedByMove = isMoveTargetAnImport(
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
    const { root } = updateImportsGeneral(filePath, updateImport, importPather);
    if (this.updateOccurred) fs.writeFileSync(filePath, root.toSource());
  };
}

export const configUpdateNonMoveTargetImport = (
  moveTargetPath: PathWithNoExtension,
  newPath: PathWithNoExtension
) => {
  [moveTargetPath, newPath] = [moveTargetPath, newPath].map(removeExtension);
  const importPather = configImportPather();
  return new UpdateNonMoveTargetImport(moveTargetPath, newPath, importPather);
};
