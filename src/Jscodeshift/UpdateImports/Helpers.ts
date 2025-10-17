import fs from "fs";
import { ASTPath, ImportDeclaration, JSCodeshift } from "jscodeshift";
import jscodeshift from "jscodeshift/src/core.js";

export type ASTImportPath = ASTPath<ImportDeclaration>;
export type FilePath = string;

export const getFileInfo = (filePath: string) => {
  const source: string = fs.readFileSync(filePath, "utf8");
  const j: JSCodeshift = jscodeshift.withParser("tsx");
  const root = j(source);
  const importPathInfos = root.find(j.ImportDeclaration);
  return { importPathInfos, root };
};
