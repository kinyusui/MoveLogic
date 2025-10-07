import fg from "fast-glob";
import { configImportPather } from "../../WorkspaceFs/ImportPather";
import { configWorkspaceFs } from "../../WorkspaceFs/WorkspaceFs";
import { removeExtension } from "../removeExtension";
import { UpdateMoveTargetImports } from "./UpdateMoveTargetImports";
import { configUpdateNonMoveTargetImport } from "./UpdateNonMoveTargetImport";

async function findFiles(
  includePatterns: string[],
  excludePatterns: string[]
): Promise<string[]> {
  const workspaceFs = configWorkspaceFs();
  const { workspaceRoot } = workspaceFs;
  const files: string[] = [];
  for (const pattern of includePatterns) {
    const found: string[] = await fg(pattern, {
      ignore: excludePatterns,
      cwd: workspaceRoot,
    });
    files.push(...found);
  }
  return files.map((f) => workspaceFs.resolve(f));
}

const findWorkspaceFiles = async () => {
  const includes = ["**/*.ts", "**/*.tsx"];
  const excludes = ["**/node_modules/**"];
  return await findFiles(includes, excludes);
};

export const updateImports = async (moveTargetPath: string, destPath: string) => {
  const workspaceFiles = await findWorkspaceFiles();

  // const outerLogicFound = allFiles.filter((path) => path.includes("OuterLogic"));
  // Update imports in all files
  const importPather = configImportPather();
  const updateOwnImports = new UpdateMoveTargetImports(
    moveTargetPath,
    destPath,
    importPather
  );
  [moveTargetPath, destPath] = [moveTargetPath, destPath].map(removeExtension);
  const updateImports = configUpdateNonMoveTargetImport(moveTargetPath, destPath);
  updateOwnImports.updateImports();
  workspaceFiles.forEach(updateImports.updateFile);
};
