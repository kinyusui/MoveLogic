import { ASTPath, CallExpression, ImportDeclaration } from "jscodeshift";

type EsmImportPath = ASTPath<ImportDeclaration>;
type CjsImportPath = ASTPath<CallExpression>;
type ImportPathG = EsmImportPath | CjsImportPath;

export type ImportPath = {
  path: string;
};

const isEsmImportPaths = (importPath: ImportPathG): importPath is EsmImportPath => {
  return importPath.node.type === "ImportDeclaration";
};

export const configImportPath = ({ pathDict }: { pathDict: ImportPathG }) => {
  if (isEsmImportPaths(pathDict)) {
    return { path: pathDict.node.source.value as string };
  } else {
    const node = pathDict.node.arguments[0] as any;
    return { path: node.value as string };
  }
};

// export type ASTImportPath = ASTPath<ImportDeclaration>;
export type FilePath = string;
