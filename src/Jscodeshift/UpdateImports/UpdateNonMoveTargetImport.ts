import fs from "fs";
import { JSCodeshift } from "jscodeshift";
import jscodeshift from "jscodeshift/src/core.js";
import { configImportPather, ImportPather } from "../../Nonvscode/ImportPather.js";
import { checkIsTsLike, getExtension } from "../../Nonvscode/makePath.js";
import { rootWorkspaceFs } from "../../vscodeFunctions/WorkspaceFs.js";
import { removeExtension } from "../removeExtension.js";
import { ASTImportPath, FilePath } from "./Helpers.js";

const makeParserExtension = (filePath: string) => {
  const extension = getExtension(filePath);
  const isTargetType = checkIsTsLike(filePath);
  if (!isTargetType) return extension;

  const tsxOrJsxType = `${extension[0]}sx`;
  return tsxOrJsxType;
};

export const getFileInfo = (filePath: string) => {
  const extension = makeParserExtension(filePath);
  const makeRoot: JSCodeshift = jscodeshift.withParser(extension);
  const source: string = fs.readFileSync(filePath, "utf8");
  const root = makeRoot(source);
  const importPathInfos = root.find(makeRoot.ImportDeclaration);
  return { importPathInfos, root };
};

type UpdateImport = (startDirPath: string, importPathInfo: ASTImportPath) => void;
export const updatePathUsingUpdater = (
  startPath: string,
  updater: UpdateImport,
  importPather: ImportPather
) => {
  const { importPathInfos, root } = getFileInfo(startPath);
  const absFilePath = importPather.workspaceFs.resolve(startPath);
  const fileDirPath = importPather.dirname(absFilePath);
  importPathInfos.forEach((importPath: ASTImportPath) =>
    updater(fileDirPath, importPath)
  );
  return { importPathInfos, root };
};

export const isRelative = (filePath: string) => filePath.startsWith(".");

export class UpdateNonMoveTargetImport {
  updateOccurred: boolean;
  constructor(
    public moveTargetPath: FilePath,
    public newPath: FilePath,
    public importPather: ImportPather
  ) {
    this.updateOccurred = false;
  }

  static isMoveTargetAnImport = (
    moveTargetPath: string,
    importPathInFile: string,
    dirOfFileWithImport: string
  ) => {
    const absMoveTargetPath = rootWorkspaceFs.resolve(moveTargetPath);
    const absImportPath = rootWorkspaceFs.resolve(
      dirOfFileWithImport,
      importPathInFile
    );
    const moveTargetNoExt = removeExtension(absMoveTargetPath);
    const importPathNoExt = removeExtension(absImportPath);
    const match = moveTargetNoExt === importPathNoExt;
    return match;
  };

  updateImport = (startDirPath: string, importPathInfo: ASTImportPath) => {
    const sourceInfo = importPathInfo.node.source;
    const importPath: string = sourceInfo.value as string;
    if (!isRelative(importPath)) return; // Skip non-relative imports

    const { moveTargetPath, newPath } = this;
    const affectedByMove = UpdateNonMoveTargetImport.isMoveTargetAnImport(
      moveTargetPath,
      importPath,
      startDirPath
    );
    if (affectedByMove) {
      const { relativeFromDir } = this.importPather;
      sourceInfo.value = relativeFromDir(startDirPath, newPath);
      this.updateOccurred = true;
    }
  };

  updateFile = (filePath: string) => {
    const fileMissing = !fs.existsSync(filePath);
    if (fileMissing) return;

    const { updateImport, importPather } = this;
    const { root } = updatePathUsingUpdater(filePath, updateImport, importPather);
    if (this.updateOccurred) fs.writeFileSync(filePath, root.toSource());
  };
}

export const configUpdateNonMoveTargetImport = (
  moveTargetPath: FilePath,
  newPath: FilePath
) => {
  [moveTargetPath, newPath] = [moveTargetPath, newPath].map(removeExtension);
  const importPather = configImportPather();
  return new UpdateNonMoveTargetImport(moveTargetPath, newPath, importPather);
};
