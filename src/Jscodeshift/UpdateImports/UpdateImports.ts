import { UndoableEdit } from "../../vscodeFunctions/Editor/UndoableEdit";
import { getProjectFiles } from "./GetFiles";
import { configUpdateMoveTargetImports } from "./UpdateMoveTargetImports";
import { configUpdateNonMoveTargetImport } from "./UpdateNonMoveTargetImport";

export const updateImports = async (
  moveTargetPath: string,
  newPath: string,
  undoableEdit: UndoableEdit
) => {
  // const outerLogicFound = allFiles.filter((path) => path.includes("OuterLogic"));
  // Update imports in all files
  const updateOwnImports = configUpdateMoveTargetImports(
    moveTargetPath,
    newPath,
    undoableEdit
  );
  updateOwnImports.updateImports();

  const updateImports = configUpdateNonMoveTargetImport(
    moveTargetPath,
    newPath,
    undoableEdit
  );
  const workspaceFiles = await getProjectFiles();
  for (const workspaceFile of workspaceFiles) {
    updateImports.updateFile(workspaceFile);
  }
};

export type UpdateImports = typeof updateImports;
