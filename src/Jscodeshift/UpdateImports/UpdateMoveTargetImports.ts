import * as fs from "fs";
import { configImportPather, ImportPather } from "../../WorkspaceFs/ImportPather";
import { ASTImportPath } from "./Helpers";
import { updateImportsGeneral } from "./UpdateNonMoveTargetImport";

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
    sourceInfo.value = newPathWrongSeparator;
  };

  updateImports = () => {
    const { importPather, updateImport, newPath } = this;
    const { root } = updateImportsGeneral(newPath, updateImport, importPather);
    fs.writeFileSync(newPath, root.toSource());
  };
}

export const configUpdateMoveTargetImports = (
  moveTargetPath: string,
  newPath: string
) => {
  const importPather = configImportPather();
  return new UpdateMoveTargetImports(moveTargetPath, newPath, importPather);
};
