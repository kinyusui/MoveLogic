import { configImportPather, ImportPather } from "../../Nonvscode/ImportPather.js";
import { fs, path } from "../../vscodeFunctions/MakeDependencyEasy.js";
import { ImportPath } from "./ImportPath.js";
import { UpdateImport, updatePathUsingUpdater } from "./UpdatePathUsingUpdater.js";

type Props = {
  moveTargetPath: string;
  newPath: string;
  newPathDir: string;
  importPather: ImportPather;
};

export class UpdateMoveTargetImports {
  constructor(public props: Props) {}

  updateImport: UpdateImport = (_: string, importPathInfo: ImportPath) => {
    const importPath = importPathInfo.path;

    if (!importPath.startsWith(".")) return; // Skip non-relative imports
    const { importPather, newPathDir, moveTargetPath } = this.props;
    const { getAbsolutePathOfImport, relativeFromDir } = importPather;
    const absImportPath = getAbsolutePathOfImport(importPath, moveTargetPath);
    const finalPath = relativeFromDir(newPathDir, absImportPath);

    importPathInfo.path = finalPath;
  };

  updateImports = () => {
    const { updateImport } = this;
    const { importPather, moveTargetPath, newPath } = this.props;
    const { ast } = updatePathUsingUpdater(moveTargetPath, updateImport, importPather);
    fs.writeFileSync(newPath, ast.toSource());
  };
}

export const configUpdateMoveTargetImports = (
  moveTargetPath: string,
  newPath: string
) => {
  const importPather = configImportPather();
  const newPathDir = path.dirname(newPath);
  return new UpdateMoveTargetImports({
    moveTargetPath,
    newPath,
    newPathDir: newPathDir,
    importPather,
  });
};
