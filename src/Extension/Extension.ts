import vscode from "vscode";
// import { configMoveLogic } from "../Jscodeshift/MoveLogic";
import { configMyQuickPick } from "../Nonvscode/Input.js";
import { HandleMove } from "./HandleMove.js";
import { configHandleUseSuggest, HandleUseSuggest } from "./HandleUseSuggest.js";
import { rootLoggerHandler } from "./Logger.js";
// import { configHandleMove } from "./NoUndoButStable/HandleMove";

import { SystemControl } from "./SystemTypes.type.js";
import { configHandleMove } from "./UndoableButBuggy/HandleMove.js";

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
  const myQuickPick = configMyQuickPick();
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
