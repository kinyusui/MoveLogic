import * as vscode from "vscode";
// import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { makeMyQuickPick, MyQuickPick } from "../Input";
import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { handleUseSuggest } from "./HandleUseSuggest";

export type QuickPickElement = vscode.QuickPick<vscode.QuickPickItem>;
type CommandInfo = [string, (...args: any[]) => any];
export class Extension {
  constructor(public myQuickPick: MyQuickPick) {}
  mainMoveLogic = async (uri: vscode.Uri) => {
    const sourcePath = uri.fsPath;
    const newDirPath = await this.myQuickPick.getInput(sourcePath);
    if (!newDirPath || newDirPath === sourcePath) return;

    const moveLogic = configMoveLogic(sourcePath, newDirPath);
    moveLogic.moveDir();
    vscode.window.showInformationMessage(`Moved: ${sourcePath} → ${newDirPath}.`);
  };

  handleMove = async (uri: vscode.Uri) => {
    const { myQuickPick } = this;
    myQuickPick.show();
    try {
      await this.mainMoveLogic(uri);
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
  return new Extension(myQuickPick);
};
