import * as fs from "fs";
import { ImportPather } from "../../WorkspaceFs/ImportPather";
import { ASTImportPath, getFileInfo } from "./Helpers";

export class UpdateMoveTargetImports {
  constructor(
    public moveTargetPath: string,
    public newPath: string,
    public importPather: ImportPather
  ) {}

  updateImport = (startDirPath: string, importPathInfo: ASTImportPath) => {
    const sourceInfo = importPathInfo.node.source;
    const importPath = sourceInfo.value as string;
    if (!importPath.startsWith(".")) return; // Skip non-relative imports
    const { moveTargetPath, importPather } = this;
    const { getAbsolutePathOfImport, relativeFromDir } = importPather;
    const absImportPath = getAbsolutePathOfImport(importPath, moveTargetPath);
    const newPathWrongSeparator = relativeFromDir(startDirPath, absImportPath);
    // const newImportPath = shortAndPosixify(newPathWrongSeparator);
    sourceInfo.value = newPathWrongSeparator;
    // sourceInfo.value = makeImportPath(absNewPath, absImportPath);
  };

  updateImports = () => {
    const { newPath, importPather } = this;
    const { importPathInfos, root } = getFileInfo(newPath);
    const absNewPath = importPather.workspaceFs.resolve(newPath);
    const startDirPath = importPather.dirname(absNewPath);
    importPathInfos.forEach((importPathInfo: ASTImportPath) =>
      this.updateImport(startDirPath, importPathInfo)
    );
    fs.writeFileSync(newPath, root.toSource());
  };
}
