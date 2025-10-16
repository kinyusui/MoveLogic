import vscode from "vscode";
import { MyQuickPick } from "../Nonvscode/Input.js";
import { LoggerHandler } from "../Nonvscode/Logger.js";

export type SystemControl = {
  myQuickPick: MyQuickPick;
  loggerHandler: LoggerHandler;
};
export type QuickPickElement = vscode.QuickPick<vscode.QuickPickItem>;
