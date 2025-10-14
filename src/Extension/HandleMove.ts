import * as fs from "fs-extra";
import * as path from "path";
import type { Uri } from "vscode";
import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { configUndoableEdit, UndoableEdit } from "../WorkspaceFs/UndoableEdit";
import { SystemControl } from "./SystemTypes";

type ContextBad = { isDir: boolean; fileDirPath: undefined; noWork: true };
type Context = { isDir: boolean; fileDirPath: string; noWork: boolean };

type Props = SystemControl & {
  undoableEdit: UndoableEdit;
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
      undoableEdit: this.props.undoableEdit,
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
    const { myQuickPick, loggerHandler } = this.props;
    try {
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
    }
  };
}

export const configHandleMove = (systemControl: SystemControl) => {
  const undoableEdit = configUndoableEdit();
  return new HandleMove({
    ...systemControl,
    undoableEdit: undoableEdit,
  });
};
