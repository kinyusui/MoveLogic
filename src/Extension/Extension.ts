import * as vscode from "vscode";
// import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { makeMyQuickPick } from "../Input";
import { configHandleMove, HandleMove } from "./HandleMove";
import { configHandleUseSuggest, HandleUseSuggest } from "./HandleUseSuggest";
import { rootLoggerHandler } from "./Logger";
import { SystemControl } from "./SystemTypes";

type CommandInfo = [string, (...args: any[]) => any];

type Props = SystemControl & {
  handleMove: HandleMove;
  handleSuggest: HandleUseSuggest;
};

export class Extension {
  constructor(public props: Props) {}

  register = (context: vscode.ExtensionContext) => {
    const { handleMove, handleSuggest } = this.props;
    const commandInfos: CommandInfo[] = [
      ["tsMoveHelper.move", handleMove.handleMove],
      ["tsMoveHelper.acceptQuickPickSuggestion", handleSuggest],
    ];
    const registerCommand = ([commandName, command]: CommandInfo) =>
      vscode.commands.registerCommand(commandName, command);
    const disposes = commandInfos.map(registerCommand);
    context.subscriptions.push(...disposes);
  };
}

export const configExtension = () => {
  const myQuickPick = makeMyQuickPick();
  const systemControl = {
    myQuickPick: myQuickPick,
    loggerHandler: rootLoggerHandler,
  };
  const handleMove = configHandleMove(systemControl);
  const handleSuggest = configHandleUseSuggest(myQuickPick.quickPick);
  return new Extension({
    ...systemControl,
    handleMove: handleMove,
    handleSuggest: handleSuggest,
  });
};
