import * as vscode from "vscode";
// Create output channel
type OutputChannel = ReturnType<(typeof vscode)["window"]["createOutputChannel"]>;
type Logger = Pick<OutputChannel, "append" | "appendLine" | "show" | "dispose">;

const makeDoNothingOutputChannel = () => {
  const doNothing = () => {};
  const doNothingOutputChannel: Logger = {
    show: doNothing,
    appendLine: doNothing,
    append: doNothing,
    dispose: doNothing,
  };
  return doNothingOutputChannel;
};

const makeRealOutputChannel = (channelName: string) => {
  return vscode.window.createOutputChannel(channelName);
};

const makeOutputChannel = (channelName: string | undefined) => {
  if (channelName === undefined) {
    return makeDoNothingOutputChannel();
  } else {
    return makeRealOutputChannel(channelName);
  }
};

// Function to log messages
export function logDebugMessage(outputChannel: Logger, message: string) {
  const formattedMessage = `[${new Date().toISOString()}]: ${message}`;
  outputChannel?.appendLine(formattedMessage);
}

export class LoggerHandler {
  constructor(public outputChannel: Logger) {}
  show = () => {
    this.outputChannel.show(true);
    this.logDebugMessage("Logger Activated.");
  };

  logDebugMessage = (message: string) => {
    logDebugMessage(this.outputChannel, message);
  };

  dispose = () => this.outputChannel.dispose();
}

export const makeLoggerHandler = (channelName: string | undefined) => {
  const outputChannel = makeOutputChannel(channelName);
  return new LoggerHandler(outputChannel);
};
