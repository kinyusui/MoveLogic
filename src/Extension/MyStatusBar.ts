import * as vscode from "vscode";

type ConfigMessageMaker = (total: number) => (progress: number) => string;
type MessageMaker = ReturnType<ConfigMessageMaker>;

type Props = {
  progress: number;
  configMessageMaker: ConfigMessageMaker;
  messageMaker: MessageMaker;
  text: string;
};

type Resolve = (end: boolean) => void;
type ControlWithProgress = {
  progress: vscode.Progress<{
    message?: string;
    increment?: number;
  }>;
  cancelToken: vscode.CancellationToken;
};

export class MyStatusBar {
  resolve: Resolve;
  controlWithProgress: ControlWithProgress | undefined;
  constructor(public props: Props) {
    this.resolve = () => {};
  }

  start = (totalItems: number) => {
    const assignWayToEnd = new Promise((resolve: Resolve) => {
      this.resolve = resolve;
    });
    const displayUntilDone = vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Moving Files.",
        cancellable: true,
      },
      async (progress, cancelToken) => {
        this.controlWithProgress = { progress, cancelToken };
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
    this.controlWithProgress?.progress?.report({
      message: text,
      increment: this.props.progress,
    });
  };

  end = () => {
    this.resolve(true);
  };
}

type SimpleConfig = { configMessageMaker: ConfigMessageMaker };
export const configMyStatusBar = ({ configMessageMaker }: SimpleConfig) => {
  const messageMaker = configMessageMaker(0);
  return new MyStatusBar({
    progress: 0,
    configMessageMaker: configMessageMaker,
    messageMaker: messageMaker,
    text: "",
  });
};
