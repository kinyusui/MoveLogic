import fs from "fs-extra";
import path from "path";
import type { Uri } from "vscode";
import { configMoveLogic } from "../Jscodeshift/MoveLogic.js";
import { EditorFunctions } from "../vscodeFunctions/Editor/EditorFunctions.type.js";
import { SystemControl } from "./SystemTypes.type.js";

type ContextBad = { isDir: boolean; fileDirPath: undefined; noWork: true };
type Context = { isDir: boolean; fileDirPath: string; noWork: boolean };

type Props = SystemControl & {
  editor: EditorFunctions;
  configEditor: () => EditorFunctions;
};

export class HandleMove {
  constructor(public props: Props) {}
  static getNewDirPath = (isDir: boolean, sourcePath: string, newDirPath: string) => {
    if (isDir) {
      const sourceLastDirName = path.basename(sourcePath);
      return path.join(newDirPath, sourceLastDirName);
    }
    return newDirPath;
  };

  static getMoveContext = (sourcePath: string, inputDirPath: string) => {
    const noWorkNeeded: ContextBad = {
      isDir: false,
      fileDirPath: undefined,
      noWork: true,
    };
    const notExist = !fs.existsSync(sourcePath);
    if (notExist) return noWorkNeeded;

    const isDir = fs.statSync(sourcePath).isDirectory();
    const fileDirPath = HandleMove.getNewDirPath(isDir, sourcePath, inputDirPath);
    const noWork = !fileDirPath || fileDirPath === sourcePath;
    return { isDir, fileDirPath, noWork } satisfies Context;
  };

  executeMove = async (isDir: boolean, sourcePath: string, fileDirPath: string) => {
    const oldDirPath = isDir ? sourcePath : path.dirname(sourcePath);
    const moveLogic = configMoveLogic({
      oldDirPath: oldDirPath,
      newDirPath: fileDirPath,
      editor: this.props.editor,
    });
    const { moveDir, moveFile } = moveLogic;
    isDir ? await moveDir() : await moveFile(sourcePath);
  };

  mainMoveLogic = async (oneUri: Uri, inputDirPath: string) => {
    const { loggerHandler } = this.props;
    const sourcePath = oneUri.fsPath;
    const { getMoveContext } = HandleMove;
    const { noWork, isDir, fileDirPath } = getMoveContext(sourcePath, inputDirPath);
    if (noWork) return;

    await this.executeMove(isDir, sourcePath, fileDirPath);
    // prettier-ignore
    const message = `\nMoved→: ${sourcePath}. `
                  + `\nTo Dir: ${fileDirPath}.`;
    loggerHandler.logDebugMessage(message);
  };

  handleMove = async (uri: Uri, selectedUris: Uri[]) => {
    const { myQuickPick, loggerHandler, editor, configEditor } = this.props;
    try {
      this.props.editor = configEditor();
      myQuickPick.show();
      const parentDir = path.dirname(uri.fsPath);
      const inputDirPath = await myQuickPick.getInput(parentDir);
      // rootLoggerHandler.logDebugMessage(inputDirPath);
      for (const oneUri of selectedUris) {
        await this.mainMoveLogic(oneUri, inputDirPath);
      }
    } catch (err: any) {
      loggerHandler.logDebugMessage(`Error: ${err}`);
    } finally {
      myQuickPick.hide(); // Guaranteed inside finally.
      await this.props.editor.applyEdit();
      loggerHandler.logDebugMessage("Done");
    }
  };
}
