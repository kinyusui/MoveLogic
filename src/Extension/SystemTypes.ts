import * as vscode from "vscode";
import { MyQuickPick } from "../Input";
import { LoggerHandler } from "../Logger";

export type SystemControl = {
  myQuickPick: MyQuickPick;
  loggerHandler: LoggerHandler;
};
export type QuickPickElement = vscode.QuickPick<vscode.QuickPickItem>;
