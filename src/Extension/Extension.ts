import * as vscode from "vscode";
// import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import * as fs from "fs-extra";
import * as path from "path";
import { makeMyQuickPick, MyQuickPick } from "../Input";
import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { LoggerHandler } from "../Logger";
import { handleUseSuggest } from "./HandleUseSuggest";
import { rootLoggerHandler } from "./Logger";

export type QuickPickElement = vscode.QuickPick<vscode.QuickPickItem>;
type CommandInfo = [string, (...args: any[]) => any];
type Uri = vscode.Uri;

const getNewDirPath = (isDir: boolean, sourcePath: string, newDirPath: string) => {
  if (isDir) {
    const sourceLastDirName = path.basename(sourcePath);
    return path.join(newDirPath, sourceLastDirName);
  } else {
    return newDirPath;
  }
};

const executeMove = async (
  isDir: boolean,
  sourcePath: string,
  realNewDirPath: string
) => {
  const oldDirPath = isDir ? sourcePath : path.dirname(sourcePath);
  const moveLogic = configMoveLogic({
    oldDirPath: oldDirPath,
    newDirPath: realNewDirPath,
  });
  const { moveDir, moveFile } = moveLogic;
  isDir ? await moveDir() : await moveFile(sourcePath);
};

export class Extension {
  constructor(public myQuickPick: MyQuickPick, public loggerHandler: LoggerHandler) {}
  mainMoveLogic = async (oneUri: Uri, newDirPath: string) => {
    const sourcePath = oneUri.fsPath;

    const isDir = fs.statSync(sourcePath).isDirectory();
    const realNewDirPath = getNewDirPath(isDir, sourcePath, newDirPath);
    if (!realNewDirPath || realNewDirPath === sourcePath) return;

    executeMove(isDir, sourcePath, realNewDirPath);

    const message = `\nMoved→: ${sourcePath}. ` + `\nTo Dir: ${realNewDirPath}.`;
    this.loggerHandler.logDebugMessage(message);
    // vscode.window.showInformationMessage(
    //   `Moved: ${sourceDirPath} → ${realNewDirPath}.`
    // );
  };

  handleMove = async (uri: Uri, selectedUris: Uri[]) => {
    const { myQuickPick } = this;
    myQuickPick.show();
    try {
      const parentDir = path.dirname(uri.fsPath);
      const newDirPath = await this.myQuickPick.getInput(parentDir);
      for (const oneUri of selectedUris) {
        await this.mainMoveLogic(oneUri, newDirPath);
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Error: ${err.message}`);
    } finally {
      myQuickPick.hide(); // Guaranteed inside finally.
    }
  };

  handleUseSuggest = () => {
    handleUseSuggest(this.myQuickPick.quickPick);
  };

  register = (context: vscode.ExtensionContext) => {
    const commandInfos: CommandInfo[] = [
      ["tsMoveHelper.move", this.handleMove],
      ["tsMoveHelper.acceptQuickPickSuggestion", this.handleUseSuggest],
    ];
    const registerCommand = ([commandName, command]: CommandInfo) =>
      vscode.commands.registerCommand(commandName, command);
    const disposes = commandInfos.map(registerCommand);
    context.subscriptions.push(...disposes);
  };
}

export const configExtension = () => {
  const myQuickPick = makeMyQuickPick();
  return new Extension(myQuickPick, rootLoggerHandler);
};
