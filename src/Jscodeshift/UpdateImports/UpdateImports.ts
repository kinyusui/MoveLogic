import { getProjectFiles } from "./GetFiles";
import { configUpdateMoveTargetImports } from "./UpdateMoveTargetImports";
import { configUpdateNonMoveTargetImport } from "./UpdateNonMoveTargetImport";

export const updateImports = async (moveTargetPath: string, destPath: string) => {
  // const outerLogicFound = allFiles.filter((path) => path.includes("OuterLogic"));
  // Update imports in all files
  const updateOwnImports = configUpdateMoveTargetImports(moveTargetPath, destPath);
  updateOwnImports.updateImports();

  const updateImports = configUpdateNonMoveTargetImport(moveTargetPath, destPath);
  const workspaceFiles = await getProjectFiles();
  workspaceFiles.forEach(updateImports.updateFile);
};

export type UpdateImports = typeof updateImports;
