import { getProjectFiles } from "./GetFiles.js";
import { configUpdateMoveTargetImports } from "./UpdateMoveTargetImports.js";
import { configUpdateNonMoveTargetImport } from "./UpdateNonMoveTargetImport.js";

export const updateImports = async (moveTargetPath: string, newPath: string) => {
  // const outerLogicFound = allFiles.filter((path) => path.includes("OuterLogic"));
  // Update imports in all files
  const updateOwnImports = configUpdateMoveTargetImports(moveTargetPath, newPath);
  updateOwnImports.updateImports();

  const updateImports = configUpdateNonMoveTargetImport(moveTargetPath, newPath);
  const workspaceFiles = await getProjectFiles();
  for (const workspaceFile of workspaceFiles) {
    updateImports.updateFile(workspaceFile);
  }
};

export type UpdateImports = typeof updateImports;
