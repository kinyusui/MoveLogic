import { ASTPath, CallExpression, ImportDeclaration } from "jscodeshift";
import jscodeshift from "jscodeshift/src/core.js";

export type EsmImportPath = ASTPath<ImportDeclaration>;
export type CjsImportPath = ASTPath<CallExpression>;
export type ImportPathG = EsmImportPath | CjsImportPath;

export interface ImportPath {
  get path(): string;
  set path(newPath: string);
}

class Esm implements ImportPath {
  constructor(public props: { pathDict: EsmImportPath }) {}
  get path() {
    return this.props.pathDict.node.source.value as string;
  }
  set path(newPath: string) {
    this.props.pathDict.node.source.value = newPath;
  }
}

class Cjs implements ImportPath {
  constructor(public props: { pathDict: CjsImportPath }) {}
  get path() {
    const importPath = this.props.pathDict.node.arguments[0] as any;
    return (importPath?.value ?? "") as string;
  }
  set path(newPath: string) {
    this.props.pathDict.node.arguments[0] = jscodeshift.stringLiteral(newPath);
  }
}

const isEsmImportPaths = (importPath: ImportPathG): importPath is EsmImportPath => {
  return importPath.node.type === "ImportDeclaration";
};

export const configImportPath = ({ pathDict }: { pathDict: ImportPathG }) => {
  if (isEsmImportPaths(pathDict)) {
    return new Esm({ pathDict: pathDict });
  } else {
    return new Cjs({ pathDict: pathDict });
  }
};

// export type ASTImportPath = ASTPath<ImportDeclaration>;
export type FilePath = string;
