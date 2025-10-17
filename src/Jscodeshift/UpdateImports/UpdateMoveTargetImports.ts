import { configImportPather, ImportPather } from "../../Nonvscode/ImportPather.js";
import { fs, path } from "../../Nonvscode/MakeDependencyEasy.js";
import { ASTImportPath } from "./Helpers.js";
import { updatePathUsingUpdater } from "./UpdateNonMoveTargetImport.js";

type Props = {
  moveTargetPath: string;
  newPath: string;
  newPathDir: string;
  importPather: ImportPather;
};

export class UpdateMoveTargetImports {
  constructor(public props: Props) {}

  updateImport = (_: string, importPathInfo: ASTImportPath) => {
    const sourceInfo = importPathInfo.node.source;
    const importPath = sourceInfo.value as string;

    if (!importPath.startsWith(".")) return; // Skip non-relative imports
    const { importPather, newPathDir, moveTargetPath } = this.props;
    const { getAbsolutePathOfImport, relativeFromDir } = importPather;
    const absImportPath = getAbsolutePathOfImport(importPath, moveTargetPath);
    const newPathWrongSeparator = relativeFromDir(newPathDir, absImportPath);

    sourceInfo.value = newPathWrongSeparator;
  };

  updateImports = () => {
    const { updateImport } = this;
    const { importPather, moveTargetPath, newPath } = this.props;
    const { root } = updatePathUsingUpdater(moveTargetPath, updateImport, importPather);
    fs.writeFileSync(newPath, root.toSource());
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
