import fs from "fs";
import { JSCodeshift } from "jscodeshift";
import { Collection } from "jscodeshift/src/Collection.js";
import jscodeshift, {
  CallExpression,
  ImportDeclaration,
} from "jscodeshift/src/core.js";
import { ImportPather } from "../../Nonvscode/ImportPather.js";
import { checkIsTsLike, getExtension } from "../../Nonvscode/makePath.js";
import { configImportPath, ImportPath } from "./ImportPath.js";

const makeParserExtension = (filePath: string) => {
  const extension = getExtension(filePath);
  const isTargetType = checkIsTsLike(filePath);
  if (!isTargetType) return extension;

  const tsxOrJsxType = `${extension[0]}sx`;
  return tsxOrJsxType;
};

const makeAst = (filePath: string) => {
  const extension = makeParserExtension(filePath);
  const _jscodeshift: JSCodeshift = jscodeshift.withParser(extension);
  const source: string = fs.readFileSync(filePath, "utf8");
  return _jscodeshift(source);
};

type ASTImportCollection = Collection<ImportDeclaration> | Collection<CallExpression>;
const getImportPaths = (astImportPath: ASTImportCollection) => {
  const paths = astImportPath.paths();
  return paths.map((importPath) => {
    return configImportPath({ pathDict: importPath });
  });
};

const getImportPathsAllTypes = (ast: Collection<any>) => {
  const esmAstCollection = ast.find(jscodeshift.ImportDeclaration);

  const requireCallee = { name: "require" };
  const lookForRequire = { callee: requireCallee };
  const cjsImports = ast.find(jscodeshift.CallExpression, lookForRequire);

  const esmImportPaths = getImportPaths(esmAstCollection);
  const cjsImportPaths = getImportPaths(cjsImports);
  return esmImportPaths.concat(cjsImportPaths);
};

export const getFileInfo = (filePath: string) => {
  const ast = makeAst(filePath);
  const importPaths = getImportPathsAllTypes(ast);
  return { importPaths, ast };
};

export type UpdateImport = (startDirPath: string, importPathInfo: ImportPath) => void;
export const updatePathUsingUpdater = (
  startPath: string,
  updater: UpdateImport,
  importPather: ImportPather
) => {
  const { importPaths, ast } = getFileInfo(startPath);
  const absFilePath = importPather.workspaceFs.resolve(startPath);
  const fileDirPath = importPather.dirname(absFilePath);
  importPaths.forEach((importPath: ImportPath) => updater(fileDirPath, importPath));
  return { ast };
};
