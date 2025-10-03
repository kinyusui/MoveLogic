import fg from "fast-glob";
import * as fs from "fs";
import jscodeshift, { ASTPath, ImportDeclaration, JSCodeshift } from "jscodeshift";
import * as path from "path";
import { rootLoggerHandler } from "../Extension/Logger";
import { posixify } from "../makePath";
import { configWorkspaceFs } from "../WorkspaceFs/WorkspaceFs";
import { removeExtension } from "./removeExtension";

const makeImportPath = (dirPath: string, newPath: string) => {
  const newPathWrongSeparator: string = path.relative(dirPath, newPath);
  const newRelativePath = posixify(newPathWrongSeparator);
  return newRelativePath.startsWith(".") ? newRelativePath : `./${newRelativePath}`;
};

export const isMoveTargetAnImport = (
  moveTargetPath: string,
  importPathInFile: string,
  dirOfFileWithImport: string
) => {
  // const workspaceFs = configWorkspaceFs();
  const absMoveTargetPath = path.resolve(moveTargetPath);
  const absImportPath = path.resolve(dirOfFileWithImport, importPathInFile);
  const match = absMoveTargetPath === absImportPath;
  if (match) {
    rootLoggerHandler.logDebugMessage(`
    ---Did Affect Another File---
    absMoveTargetpath:   ${absMoveTargetPath}
    absImportPath:       ${absImportPath}
    dirOfFileWithImport: ${dirOfFileWithImport}
    importPathInFile:    ${importPathInFile}
    `);
  }
  return match;
};

type ASTImportPath = ASTPath<ImportDeclaration>;

type PathWithNoExtension = string;
export class UpdateImports {
  updateOccurred: boolean;
  constructor(
    public moveTargetPath: PathWithNoExtension,
    public newPath: PathWithNoExtension
  ) {
    this.updateOccurred = false;
  }

  getFileInfo = (filePath: string) => {
    const source: string = fs.readFileSync(filePath, "utf8");
    const j: JSCodeshift = jscodeshift.withParser("tsx");
    const root = j(source);
    const importPaths = root.find(j.ImportDeclaration);
    return { importPaths, root };
  };

  handleUpdateFileImport = (importPathInfo: ASTImportPath, fileDirPath: string) => {
    const importPath: string = importPathInfo.node.source.value as string;
    if (!importPath.startsWith(".")) return; // Skip non-relative imports

    const { moveTargetPath, newPath } = this;
    const affectedByMove = isMoveTargetAnImport(
      moveTargetPath,
      importPath,
      fileDirPath
    );
    if (affectedByMove) {
      importPathInfo.node.source.value = makeImportPath(fileDirPath, newPath);
      this.updateOccurred = true;
    }
  };

  updateFile = (filePath: string) => {
    const { importPaths, root } = this.getFileInfo(filePath);
    const fileDirPath = path.dirname(filePath);
    importPaths.forEach((importPath: ASTImportPath) =>
      this.handleUpdateFileImport(importPath, fileDirPath)
    );

    if (this.updateOccurred) fs.writeFileSync(filePath, root.toSource());
  };
}

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
  [moveTargetPath, destPath] = [moveTargetPath, destPath].map(removeExtension);
  const updateImports = new UpdateImports(moveTargetPath, destPath);
  workspaceFiles.forEach(updateImports.updateFile);
};
