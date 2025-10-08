import * as vscode from "vscode";
// import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { makeMyQuickPick, MyQuickPick } from "../Input";
import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { handleUseSuggest } from "./QuickPick";

// type WaitForInput = (sourcePath: string) => Promise<string | undefined>;
// const promptNewPath: WaitForInput = async (sourcePath: string) => {
//   return await vscode.window.showInputBox({
//     prompt: "Enter new path for file/folder",
//     value: sourcePath,
//   });
// };

// const promptWithSuggestions: WaitForInput = async (sourcePath: string) => {
//   const waitForInput = new Promise(async (resolve: Resolve) => {
//     const quickPick = await makeMyQuickPick(sourcePath, resolve);
//     // resolve(quickPick);
//   });
//   return await waitForInput;
// };

// const configHandleMove = (waitForInput: WaitForInput) => {
//   const handleMove = async (uri: vscode.Uri) => {
//     try {
//       const sourcePath = uri.fsPath;
//       const newDirPath = await waitForInput(sourcePath);
//       if (!newDirPath || newDirPath === sourcePath) return;

//       const moveLogic = configMoveLogic(sourcePath, newDirPath);
//       moveLogic.moveDir();
//       vscode.window.showInformationMessage(`Moved: ${sourcePath} → ${newDirPath}.`);
//     } catch (err: any) {
//       vscode.window.showErrorMessage(`Error: ${err.message}`);
//     }
//   };
//   return handleMove;
// };

// export const handleMove = configHandleMove(promptWithSuggestions);

export type QuickPickElement = vscode.QuickPick<vscode.QuickPickItem>;
type CommandInfo = [string, (...args: any[]) => any];
export class Extension {
  constructor(public myQuickPick: MyQuickPick) {}
  handleMove = async (uri: vscode.Uri) => {
    try {
      const sourcePath = uri.fsPath;
      const newDirPath = await this.myQuickPick.getInput();
      if (!newDirPath || newDirPath === sourcePath) return;
      //
      const moveLogic = configMoveLogic(sourcePath, newDirPath);
      moveLogic.moveDir();
      vscode.window.showInformationMessage(`Moved: ${sourcePath} → ${newDirPath}.`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Error: ${err.message}`);
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
