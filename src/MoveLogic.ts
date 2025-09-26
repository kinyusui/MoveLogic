import { Presets, SingleBar } from "cli-progress";
import * as fs from "fs-extra";
import * as path from "path";
import { Project, SourceFile } from "ts-morph";
import {
  Posixify,
  posixify
} from "./makePath";

export const moveFile = (file: SourceFile, oldDirPath: string, newDirPath: string) => {
  const relativePath = path.relative(oldDirPath, file.getFilePath());
  const newPath = path.join(newDirPath, relativePath);
  file.move(newPath, { overwrite: true }); // move and update imports automatically
};

type MoveFile = typeof moveFile;

type CommonProps = {
  project: Project;
  moveFile: MoveFile;
};
type ShowProgress = (i: number, total: number) => void;
type MoveDirProps = CommonProps & {
  log: boolean;
  makeShowProgress: MakeShowProgress;
  posixify: Posixify
};
class MoveLogic {
  constructor(public props: MoveDirProps) {}
  getSourceFiles = (project: Project, oldDirPath: string) => {
    const targetFileMatcher = this.props.posixify(`${oldDirPath}/**/*.ts`);
    return project.getSourceFiles(targetFileMatcher);
  }

  makeMoveFile = (sourceFiles: SourceFile[], oldDirPath: string, newDirPath: string) => {
    const { moveFile, makeShowProgress, log } = this.props;
    const total = sourceFiles.length;
    const showProgress = makeShowProgress(log);
    return (file: SourceFile, i: number) => {
      moveFile(file, oldDirPath, newDirPath);
      showProgress(i + 1, total);
    };
  }

  moveFiles = (sourceFiles: SourceFile[], oldDirPath: string, newDirPath: string) => {
    const moveFile = this.makeMoveFile(sourceFiles, oldDirPath, newDirPath);
    sourceFiles.forEach(moveFile);
  }

  moveDir = (oldDirPath: string, newDirPath: string) => {
    const { project } = this.props;
    fs.ensureDirSync(newDirPath); // Ensure new directory exists
    const sourceFiles = this.getSourceFiles(project, oldDirPath);
    this.moveFiles(sourceFiles, oldDirPath, newDirPath)
    project.saveSync(); // --- Save all changes ---
  }
}

const makeBar = () => {
  const progressBarText =
    "Moving files |{bar}| {percentage}% || {value}/{total} Files;";
  return new SingleBar(
    { format: progressBarText },
    Presets.shades_classic,
  );
};

const makeShowProgress = (log: boolean): ShowProgress => {
  const bar = makeBar();
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
  project: Project;
  log: boolean;
};
export const configMoveLogic = ({ project, log = false }: ArgConfigMoveDir) => {
  const moveDir = new MoveLogic({ project, moveFile, makeShowProgress, log, posixify });
  return moveDir;
};


