import { Presets, SingleBar } from "cli-progress";
import * as fs from "fs-extra";
import { Project, SourceFile } from "ts-morph";
import * as vscode from "vscode";
import { rootLoggerHandler } from "../Extension/Logger";
import { LoggerHandler } from "../Logger";
import { baseMakeNewPath, Posixify, posixify } from "../makePath";
import { RemoveEmptyDir } from "../RemoveEmptyDir";
import { makeProject } from "./Project";

export const moveFile = (file: SourceFile, oldDirPath: string, newDirPath: string) => {
  const newPath = baseMakeNewPath(file.getFilePath(), oldDirPath, newDirPath);
  file.move(newPath, { overwrite: true }); // move and update imports automatically
};

type MoveFile = typeof moveFile;

type CommonProps = {
  project: Project;
  moveFile: MoveFile;
};
type ShowProgress = (i: number, total: number) => void;
type MoveDirProps = CommonProps & {
  loggerHandler: LoggerHandler;
  showProgress: ShowProgress;
  posixify: Posixify;
  removeEmptyDir: RemoveEmptyDir;
};
class MoveLogic {
  constructor(public props: MoveDirProps) {}
  getSourceFiles = (project: Project, oldDirPath: string) => {
    const targetFileMatcher = this.props.posixify(`${oldDirPath}/**/*.ts`);
    return project.getSourceFiles(targetFileMatcher);
  };

  makeMoveFile = (
    sourceFiles: SourceFile[],
    oldDirPath: string,
    newDirPath: string
  ) => {
    const { moveFile, showProgress } = this.props;
    const total = sourceFiles.length;
    return (file: SourceFile, i: number) => {
      moveFile(file, oldDirPath, newDirPath);
      showProgress(i + 1, total);
    };
  };

  moveFiles = (sourceFiles: SourceFile[], oldDirPath: string, newDirPath: string) => {
    const moveFile = this.makeMoveFile(sourceFiles, oldDirPath, newDirPath);
    sourceFiles.forEach(moveFile);
  };

  moveDir = async (oldDirPath: string, newDirPath: string) => {
    const { project, removeEmptyDir } = this.props;
    fs.ensureDirSync(newDirPath); // Ensure new directory exists
    const sourceFiles = this.getSourceFiles(project, oldDirPath);
    this.moveFiles(sourceFiles, oldDirPath, newDirPath);
    project.saveSync(); // --- Save all changes ---

    await removeEmptyDir.removeEmptyDir(oldDirPath);
    this.props.loggerHandler.logDebugMessage("Removed Directories");
    await project.save();
  };
}

const makeBar = () => {
  const progressBarText =
    "Moving files |{bar}| {percentage}% || {value}/{total} Files;";
  return new SingleBar(
    {
      format: progressBarText,
    },
    Presets.shades_classic
  );
};
type MakeBar = typeof makeBar;
type Bar = ReturnType<MakeBar>;

const makeShowProgress = (log: boolean, bar: Bar): ShowProgress => {
  const yesShowProgress: ShowProgress = (i: number, total: number) => {
    if (i === 0) bar.start(total, i);
    bar.increment();
    if (i === total - 1) bar.stop;
  };
  const noShowProgress: ShowProgress = (i: number, total: number) => {};
  return log ? yesShowProgress : noShowProgress;
};
type MakeShowProgress = typeof makeShowProgress;

type ArgConfigMoveDir = {
  uri: vscode.Uri;
  log: boolean;
};
export const configMoveLogic = ({ uri, log = false }: ArgConfigMoveDir) => {
  // const logChannelName = log ? 'Kai_Move_TS_DIR' : undefined;
  const project = makeProject(uri);
  const loggerHandler = rootLoggerHandler; //makeLoggerHandler(logChannelName);
  const bar = makeBar();
  const showProgress = makeShowProgress(log, bar);
  const removeEmptyDir = new RemoveEmptyDir();
  const moveDir = new MoveLogic({
    project,
    moveFile,
    showProgress,
    loggerHandler,
    posixify,
    removeEmptyDir,
  });
  return moveDir;
};
