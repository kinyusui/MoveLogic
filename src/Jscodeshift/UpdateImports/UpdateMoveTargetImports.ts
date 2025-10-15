import { rootLoggerHandler } from "../../Extension/Logger";
import { fs } from "../../Nonvscode/MakeDependencyEasy";
import { configImportPather, ImportPather } from "../../vscodeFunctions/ImportPather";
import { ASTImportPath } from "./Helpers";
import { updatePathUsingUpdater } from "./UpdateNonMoveTargetImport";

type Props = {
  moveTargetPath: string;
  newPath: string;
  importPather: ImportPather;
};

export class UpdateMoveTargetImports {
  constructor(public props: Props) {}

  updateImport = (startDirPath: string, importPathInfo: ASTImportPath) => {
    const sourceInfo = importPathInfo.node.source;
    const importPath = sourceInfo.value as string;
    if (!importPath.startsWith(".")) return; // Skip non-relative imports
    const { moveTargetPath, importPather } = this.props;
    const { getAbsolutePathOfImport, relativeFromDir } = importPather;
    const absImportPath = getAbsolutePathOfImport(importPath, moveTargetPath);
    const newPathWrongSeparator = relativeFromDir(startDirPath, absImportPath);
    sourceInfo.value = newPathWrongSeparator;
  };

  updateImports = () => {
    const { updateImport } = this;
    const { importPather, newPath, moveTargetPath } = this.props;
    const { root } = updatePathUsingUpdater(moveTargetPath, updateImport, importPather);
    fs.writeFileSync(newPath, root.toSource());
    rootLoggerHandler.logDebugMessage(newPath);
    // await undoableEdit.rewrite(newPath, root.toSource());
  };
}

export const configUpdateMoveTargetImports = (
  moveTargetPath: string,
  newPath: string
) => {
  const importPather = configImportPather();
  return new UpdateMoveTargetImports({
    moveTargetPath,
    newPath,
    importPather,
  });
};
