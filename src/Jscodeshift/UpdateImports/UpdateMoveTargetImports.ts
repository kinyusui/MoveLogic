import { rootLoggerHandler } from "../../Extension/Logger";
import { configImportPather, ImportPather } from "../../WorkspaceFs/ImportPather";
import { rootUndoableEdit, UndoableEdit } from "../../WorkspaceFs/UndoableEdit";
import { ASTImportPath } from "./Helpers";
import { updatePathUsingUpdater } from "./UpdateNonMoveTargetImport";

type Props = {
  moveTargetPath: string;
  newPath: string;
  importPather: ImportPather;
  undoableEdit: UndoableEdit;
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

  updateImports = async () => {
    const { updateImport } = this;
    const { importPather, newPath, undoableEdit } = this.props;
    const { root } = updatePathUsingUpdater(newPath, updateImport, importPather);
    // fs.writeFileSync(newPath, root.toSource());
    rootLoggerHandler.logDebugMessage(newPath);
    await undoableEdit.rewrite(newPath, root.toSource());
  };
}

export const configUpdateMoveTargetImports = (
  moveTargetPath: string,
  newPath: string
) => {
  const undoableEdit = rootUndoableEdit; //configUndoableEdit();
  const importPather = configImportPather();
  return new UpdateMoveTargetImports({
    moveTargetPath,
    newPath,
    importPather,
    undoableEdit,
  });
};
