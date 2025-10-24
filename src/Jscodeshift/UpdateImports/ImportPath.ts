import { ASTPath, CallExpression, ImportDeclaration } from "jscodeshift";
import jscodeshift from "jscodeshift/src/core.js";

type EsmImportPath = ASTPath<ImportDeclaration>;
type CjsImportPath = ASTPath<CallExpression>;
type ImportPathG = EsmImportPath | CjsImportPath;

export interface ImportPath {
  get path(): string;
  set path(newPath: string);
}

class Esm implements ImportPath {
  constructor(public props: { pathDict: EsmImportPath }) {}
  get path(): string {
    return this.props.pathDict.node.source.value as string;
  }
  set path(newPath: string) {
    this.props.pathDict.node.source.value = newPath;
  }
}

class Cjs implements ImportPath {
  constructor(public props: { pathDict: CjsImportPath }) {}
  get path(): string {
    const importInfo = this.props.pathDict.node.arguments[0] as any;
    return importInfo.value as string;
  }
  set path(newPath: string) {
    const args = this.props.pathDict.node.arguments;
    args[0] = jscodeshift.literal(newPath);
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
