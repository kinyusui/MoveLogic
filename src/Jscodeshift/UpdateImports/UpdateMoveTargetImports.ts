import * as fs from "fs";
import { ImportPather, shortAndPosixify } from "../../WorkspaceFs/ImportPather";
import { ASTImportPath, getFileInfo } from "./Helpers";

export class UpdateMoveTargetImports {
  constructor(
    public moveTargetPath: string,
    public newPath: string,
    public importPather: ImportPather
  ) {}

  updateImport = (absNewPath: string, importPathInfo: ASTImportPath) => {
    const sourceInfo = importPathInfo.node.source;
    const importPath = sourceInfo.value as string;
    if (!importPath.startsWith(".")) return; // Skip non-relative imports
    const { moveTargetPath, importPather } = this;
    const absImportPath = importPather.getAbsolutePathOfImport(
      importPath,
      moveTargetPath
    );
    const newPathWrongSeparator = importPather.relative(absNewPath, absImportPath);
    const newImportPath = shortAndPosixify(newPathWrongSeparator);
    sourceInfo.value = newImportPath;
  };

  updateImports = () => {
    const { newPath, importPather } = this;
    const { importPathInfos, root } = getFileInfo(newPath);
    const absNewPath = importPather.workspaceFs.resolve(newPath);
    importPathInfos.forEach((importPathInfo: ASTImportPath) =>
      this.updateImport(absNewPath, importPathInfo)
    );
    fs.writeFileSync(newPath, root.toSource());
  };
}
