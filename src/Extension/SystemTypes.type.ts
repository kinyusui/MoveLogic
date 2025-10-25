import * as vscode from "vscode";
import { LoggerHandler } from "../Nonvscode/Logger.js";
import { MyQuickPick } from "../vscodeFunctions/Input.js";

export type SystemControl = {
  myQuickPick: MyQuickPick;
  loggerHandler: LoggerHandler;
};
export type QuickPickElement = vscode.QuickPick<vscode.QuickPickItem>;
