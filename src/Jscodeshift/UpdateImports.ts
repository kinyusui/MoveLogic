import * as fs from "fs";
import jscodeshift, { ASTPath, ImportDeclaration, JSCodeshift } from "jscodeshift";
import * as path from "path";

const makeImportPath = (dirPath: string, newPath: string) => {
  const newRelativePath: string = path.relative(dirPath, newPath).replace(/\\/g, "/");
  return newRelativePath.startsWith(".") ? newRelativePath : `./${newRelativePath}`;
};

type ASTImportPath = ASTPath<ImportDeclaration>;

export class UpdateImports {
  updateOccurred: boolean;
  constructor(public moveTargetPath: string, public newPath: string) {
    this.updateOccurred = false;
  }

  getFileInfo = (filePath: string) => {
    const source: string = fs.readFileSync(filePath, "utf8");
    const j: JSCodeshift = jscodeshift.withParser("tsx");
    const root = j(source);
    const importPaths = root.find(j.ImportDeclaration);
    return { importPaths, root };
  };

  handleUpdateFileImport = (importPath: ASTImportPath, dirPath: string) => {
    const importValue: string = importPath.node.source.value as string;
    if (!importValue.startsWith(".")) return; // Skip non-relative imports

    const { moveTargetPath, newPath } = this;
    const absoluteImportPath: string = path.resolve(dirPath, importValue);
    const affectedByMove = absoluteImportPath === path.resolve(moveTargetPath);
    if (affectedByMove) {
      importPath.node.source.value = makeImportPath(dirPath, newPath);
      this.updateOccurred = true;
    }
  };

  updateFile = (filePath: string) => {
    const { importPaths, root } = this.getFileInfo(filePath);
    const dirPath = path.dirname(filePath);
    importPaths.forEach((importPath: ASTImportPath) =>
      this.handleUpdateFileImport(importPath, dirPath)
    );

    if (this.updateOccurred) fs.writeFileSync(filePath, root.toSource());
  };
}
