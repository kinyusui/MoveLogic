import * as fs from "fs";
import { ASTPath, ImportDeclaration, JSCodeshift } from "jscodeshift";
import jscodeshift from "jscodeshift/src/core";
import * as path from "path";
import { posixify } from "../../makePath";

export const makeImportPath = (dirPath: string, newPath: string) => {
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
  return match;
};

export type ASTImportPath = ASTPath<ImportDeclaration>;
export type PathWithNoExtension = string;

export const getFileInfo = (filePath: string) => {
  const source: string = fs.readFileSync(filePath, "utf8");
  const j: JSCodeshift = jscodeshift.withParser("tsx");
  const root = j(source);
  const importPathInfos = root.find(j.ImportDeclaration);
  return { importPathInfos, root };
};
