import * as vscode from "vscode";
import { ConfigMessageMaker, MessageMaker } from "../Jscodeshift/MoveLogic.js";

type Resolve = (end: boolean) => void;
type Reject = () => void;
type ControlWithProgress = {
  progress: vscode.Progress<{
    message?: string;
    increment?: number;
  }>;
  cancelToken: vscode.CancellationToken;
};

type Props = {
  configMessageMaker: ConfigMessageMaker;
  controlWithProgress: ControlWithProgress | undefined;
};
const doNothing = () => {};
export class MyStatusBar {
  progress: number = 0;
  incrementPer1: number = 0;
  messageMaker: MessageMaker = this.props.configMessageMaker(0);
  resolve: Resolve = doNothing;
  reject: Reject = doNothing;
  constructor(public props: Props) {}

  giveControlToStatusBar = (resolve: Resolve, reject: Reject) => {
    this.resolve = resolve;
    this.reject = reject;
  };

  start = (totalItems: number) => {
    this.reject();

    const existUntilBarEndsPromise = new Promise(this.giveControlToStatusBar);
    const displayUntilDone = vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Moving Files.",
        cancellable: true,
      },
      async (progress, cancelToken) => {
        this.props.controlWithProgress = { progress, cancelToken };
        await existUntilBarEndsPromise;
      }
    );
    this.progress = 0;
    this.incrementPer1 = (1 / totalItems) * 100;
    this.messageMaker = this.props.configMessageMaker(totalItems);
  };

  updateProgress = (amount: number = 1) => {
    const { messageMaker } = this;
    this.progress += amount;
    const text = messageMaker(this.progress);
    const incrementPercent = this.incrementPer1 * amount;
    this.props.controlWithProgress?.progress?.report({
      message: text,
      increment: incrementPercent,
    });
  };

  end = () => {
    this.resolve(true);
  };
}

type SimpleConfig = { configMessageMaker: ConfigMessageMaker };
export const configMyStatusBar = ({ configMessageMaker }: SimpleConfig) => {
  return new MyStatusBar({
    configMessageMaker: configMessageMaker,
    controlWithProgress: undefined,
  });
};
