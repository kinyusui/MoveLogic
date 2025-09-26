import { Presets, SingleBar } from "cli-progress";
import * as fs from "fs-extra";
import * as path from "path";
import { Project, SourceFile } from "ts-morph";
import {
  PosixPath
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
};
class MoveLogic {
  constructor(public props: MoveDirProps) {}
  moveDir(oldDirPath: PosixPath, newDirPath: PosixPath) {
    // Ensure new directory exists
    const { moveFile, project, makeShowProgress, log } = this.props;
    fs.ensureDirSync(newDirPath);
    const targetFileMatcher = `${oldDirPath}/**/*.ts`;
    const sourceFiles = project.getSourceFiles(targetFileMatcher);

    const total = sourceFiles.length;
    const showProgress = makeShowProgress(log);
    sourceFiles.forEach((file, i) => {
      moveFile(file, oldDirPath, newDirPath);
      showProgress(i + 1, total);
    });
    // --- Save all changes ---
    project.saveSync();
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
  const moveDir = new MoveLogic({ project, moveFile, makeShowProgress, log });
  return moveDir;
};


