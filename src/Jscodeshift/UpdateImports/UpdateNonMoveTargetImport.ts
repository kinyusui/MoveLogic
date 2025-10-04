import * as fs from "fs";
import * as path from "path";
import {
  ASTImportPath,
  getFileInfo,
  isMoveTargetAnImport,
  makeImportPath,
  PathWithNoExtension,
} from "./Helpers";

export class UpdateNonMoveTargetImport {
  updateOccurred: boolean;
  constructor(
    public moveTargetPath: PathWithNoExtension,
    public newPath: PathWithNoExtension
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
      importPathInfo.node.source.value = makeImportPath(fileDirPath, newPath);
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
