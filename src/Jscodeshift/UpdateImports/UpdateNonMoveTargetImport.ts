import * as fs from "fs";
import * as path from "path";
import { configImportPather, ImportPather } from "../../WorkspaceFs/ImportPather";
import {
  ASTImportPath,
  getFileInfo,
  isMoveTargetAnImport,
  PathWithNoExtension,
} from "./Helpers";

export class UpdateNonMoveTargetImport {
  updateOccurred: boolean;
  constructor(
    public moveTargetPath: PathWithNoExtension,
    public newPath: PathWithNoExtension,
    public importPather: ImportPather
  ) {
    this.updateOccurred = false;
  }

  handleUpdateFileImport = (importPathInfo: ASTImportPath, fileDirPath: string) => {
    const importPath: string = importPathInfo.node.source.value as string;
    if (!importPath.startsWith(".")) return; // Skip non-relative imports

    const { moveTargetPath, newPath } = this;
    const affectedByMove = isMoveTargetAnImport(
      moveTargetPath,
      importPath,
      fileDirPath
    );
    if (affectedByMove) {
      const { relativeFromDir } = this.importPather;
      importPathInfo.node.source.value = relativeFromDir(fileDirPath, newPath);
      this.updateOccurred = true;
    }
  };

  updateFile = (filePath: string) => {
    const { importPathInfos, root } = getFileInfo(filePath);
    const fileDirPath = path.dirname(filePath);
    importPathInfos.forEach((importPath: ASTImportPath) =>
      this.handleUpdateFileImport(importPath, fileDirPath)
    );

    if (this.updateOccurred) fs.writeFileSync(filePath, root.toSource());
  };
}

export const configUpdateNonMoveTargetImport = (
  moveTargetPath: PathWithNoExtension,
  newPath: PathWithNoExtension
) => {
  const importPather = configImportPather();
  return new UpdateNonMoveTargetImport(moveTargetPath, newPath, importPather);
};
