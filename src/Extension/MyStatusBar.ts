import * as vscode from "vscode";

type ConfigMessageMaker = (total: number) => (progress: number) => string;
type MessageMaker = ReturnType<ConfigMessageMaker>;

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
  progress: number;
  configMessageMaker: ConfigMessageMaker;
  messageMaker: MessageMaker;
  text: string;
  resolve: Resolve;
  reject: Reject;
  controlWithProgress: ControlWithProgress | undefined;
};

export class MyStatusBar {
  constructor(public props: Props) {}

  start = (totalItems: number) => {
    this.props.reject();

    const assignWayToEnd = new Promise((resolve: Resolve, reject: Reject) => {
      this.props.resolve = resolve;
      this.props.reject = reject;
    });
    const displayUntilDone = vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Moving Files.",
        cancellable: true,
      },
      async (progress, cancelToken) => {
        this.props.controlWithProgress = { progress, cancelToken };
        await assignWayToEnd;
      }
    );
    this.props.progress = 0;
    this.props.messageMaker = this.props.configMessageMaker(totalItems);
  };

  updateProgress = (amount: number = 1) => {
    const { messageMaker } = this.props;
    this.props.progress += amount;
    const text = messageMaker(this.props.progress);
    this.props.controlWithProgress?.progress?.report({
      message: text,
      increment: this.props.progress,
    });
  };

  end = () => {
    this.props.resolve(true);
  };
}

type SimpleConfig = { configMessageMaker: ConfigMessageMaker };
export const configMyStatusBar = ({ configMessageMaker }: SimpleConfig) => {
  const messageMaker = configMessageMaker(0);
  const doNothing = () => {};
  return new MyStatusBar({
    progress: 0,
    configMessageMaker: configMessageMaker,
    messageMaker: messageMaker,
    text: "",
    reject: doNothing,
    resolve: doNothing,
    controlWithProgress: undefined,
  });
};
