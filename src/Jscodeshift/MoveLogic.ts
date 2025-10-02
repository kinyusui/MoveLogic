import fg from "fast-glob";
import * as fs from "fs";
import * as path from "path";
import { rootLoggerHandler } from "../Extension/Logger";
import { configMakeNewPath, getFullPaths, MakeNewPath } from "../makePath";
import { UpdateImports } from "./UpdateImports";

async function findFiles(
  includePatterns: string[],
  excludePatterns: string[]
): Promise<string[]> {
  const files: string[] = [];
  for (const pattern of includePatterns) {
    const found: string[] = await fg(pattern, { ignore: excludePatterns });
    files.push(...found);
  }
  return files.map((f) => path.resolve(f));
}

const updateImports = async (moveTargetPath: string, destPath: string) => {
  const includes = ["**/*.ts", "**/*.tsx"];
  const excludes = ["**/node_modules/**"];
  const allFiles: string[] = await findFiles(includes, excludes);
  // Update imports in all files
  const updateImports = new UpdateImports(moveTargetPath, destPath);
  allFiles.forEach((file) => updateImports.updateFile(file));
};

const makePathPossible = (filePath: string) => {
  const dirPath = path.dirname(filePath);
  const dirMissing = !fs.existsSync(dirPath);
  if (dirMissing) {
    makePathPossible(dirPath);
    fs.mkdirSync(dirPath);
  }
};

export class MoveLogic {
  makeNewPath: MakeNewPath;
  constructor(public oldDirPath: string, public newDirPath: string) {
    this.makeNewPath = configMakeNewPath(oldDirPath, newDirPath);
  }

  moveFile = async (sourceFile: string) => {
    // Normalize paths
    const moveTargetPath: string = path.normalize(sourceFile);
    const endFilePath = this.makeNewPath(sourceFile);
    makePathPossible(endFilePath);
    await fs.promises.rename(moveTargetPath, endFilePath);
    rootLoggerHandler.logDebugMessage(`Moved ${moveTargetPath} to ${endFilePath}`);
    updateImports(moveTargetPath, endFilePath);
  };

  moveDir = async () => {
    const { oldDirPath } = this;
    const filePaths = getFullPaths(oldDirPath);
    filePaths.forEach(this.moveFile);
  };
}
