import { getProjectFiles } from "./GetFiles";
import { configUpdateMoveTargetImports } from "./UpdateMoveTargetImports";
import { configUpdateNonMoveTargetImport } from "./UpdateNonMoveTargetImport";

export const updateImports = async (moveTargetPath: string, newPath: string) => {
  // const outerLogicFound = allFiles.filter((path) => path.includes("OuterLogic"));
  // Update imports in all files
  const updateOwnImports = configUpdateMoveTargetImports(moveTargetPath, newPath);
  await updateOwnImports.updateImports();

  const updateImports = configUpdateNonMoveTargetImport(moveTargetPath, newPath);
  const workspaceFiles = await getProjectFiles();
  for (const workspaceFile of workspaceFiles) {
    await updateImports.updateFile(workspaceFile);
  }
};

export type UpdateImports = typeof updateImports;
