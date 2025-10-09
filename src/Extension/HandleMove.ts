import * as fs from "fs-extra";
import * as path from "path";
import type { Uri } from "vscode";
import * as vscode from "vscode";
import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { SystemControl } from "./SystemTypes";

const getNewDirPath = (isDir: boolean, sourcePath: string, newDirPath: string) => {
  if (isDir) {
    const sourceLastDirName = path.basename(sourcePath);
    return path.join(newDirPath, sourceLastDirName);
  }
  return newDirPath;
};

type ContextBad = { isDir: boolean; fileDirPath: undefined; noWork: true };
type Context = { isDir: boolean; fileDirPath: string; noWork: boolean };
const getMoveContext = (sourcePath: string, inputDirPath: string) => {
  const context: ContextBad = {
    isDir: false,
    fileDirPath: undefined,
    noWork: true,
  };
  const notExist = !fs.existsSync(sourcePath);
  if (notExist) return context;

  const isDir = fs.statSync(sourcePath).isDirectory();
  const fileDirPath = getNewDirPath(isDir, sourcePath, inputDirPath);
  const noWork = !fileDirPath || fileDirPath === sourcePath;
  return { isDir, fileDirPath, noWork } satisfies Context;
};
type GetMoveContext = typeof getMoveContext;

const executeMove = async (isDir: boolean, sourcePath: string, fileDirPath: string) => {
  const oldDirPath = isDir ? sourcePath : path.dirname(sourcePath);
  const moveLogic = configMoveLogic({
    oldDirPath: oldDirPath,
    newDirPath: fileDirPath,
  });
  const { moveDir, moveFile } = moveLogic;
  isDir ? await moveDir() : await moveFile(sourcePath);
};
type ExecuteMove = typeof executeMove;

type Props = SystemControl & {
  getMoveContext: GetMoveContext;
  executeMove: ExecuteMove;
};

export class HandleMove {
  constructor(public props: Props) {}
  mainMoveLogic = async (oneUri: Uri, inputDirPath: string) => {
    const { getMoveContext, executeMove, loggerHandler } = this.props;
    const sourcePath = oneUri.fsPath;
    const { noWork, isDir, fileDirPath } = getMoveContext(sourcePath, inputDirPath);
    if (noWork) return;

    await executeMove(isDir, sourcePath, fileDirPath);

    const message = `\nMoved→: ${sourcePath}. ` + `\nTo Dir: ${fileDirPath}.`;
    loggerHandler.logDebugMessage(message);
  };

  handleMove = async (uri: Uri, selectedUris: Uri[]) => {
    const { myQuickPick } = this.props;
    myQuickPick.show();
    try {
      const parentDir = path.dirname(uri.fsPath);
      const inputDirPath = await myQuickPick.getInput(parentDir);
      for (const oneUri of selectedUris) {
        await this.mainMoveLogic(oneUri, inputDirPath);
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Error: ${err.message}`);
    } finally {
      myQuickPick.hide(); // Guaranteed inside finally.
    }
  };
}

export const configHandleMove = (systemControl: SystemControl) => {
  return new HandleMove({
    ...systemControl,
    getMoveContext: getMoveContext,
    executeMove: executeMove,
  });
};
