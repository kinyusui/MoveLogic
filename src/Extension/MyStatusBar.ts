import * as vscode from "vscode";

type ConfigMessageMaker = (total: number) => (progress: number) => string;
type MessageMaker = ReturnType<ConfigMessageMaker>;

type Props = {
  statusBar: vscode.StatusBarItem;
  progress: number;
  configMessageMaker: ConfigMessageMaker;
  messageMaker: MessageMaker;
};

export class MyStatusBar {
  constructor(public props: Props) {}
  show = () => {
    const { statusBar } = this.props;
    statusBar.text = `Started Moving Files.`;
    statusBar.show();
    this.props.progress = 0;
  };

  start = (totalItems: number) => {
    this.show();
    this.props.messageMaker = this.props.configMessageMaker(totalItems);
  };

  updateProgress = (amount: number = 1) => {
    const { statusBar, messageMaker } = this.props;
    this.props.progress += amount;
    statusBar.text = messageMaker(this.props.progress);
  };

  hide = () => this.props.statusBar.hide();
}

type SimpleConfig = { configMessageMaker: ConfigMessageMaker };
export const configMyStatusBar = ({ configMessageMaker }: SimpleConfig) => {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  const messageMaker = configMessageMaker(0);
  return new MyStatusBar({
    statusBar: statusBar,
    progress: 0,
    configMessageMaker: configMessageMaker,
    messageMaker: messageMaker,
  });
};
