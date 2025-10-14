import callsites from "callsites";
import * as fs from "fs-extra";
import * as path from "path";
import { fillDefaults } from "./Dict";

export const getLastDir = (filePath: string) => {
  const pathParts = filePath.split(path.sep);
  const lastPart = pathParts[pathParts.length - 1];
  const endingIsDir = !lastPart.includes(".");

  const actualPathToDir = endingIsDir ? filePath : path.dirname(filePath);
  return path.basename(actualPathToDir);
};

export const baseMakeNewPath = (
  filePath: string,
  oldDirPath: string,
  newDirPath: string
) => {
  const relativePath = path.relative(oldDirPath, filePath);
  return path.join(newDirPath, relativePath);
};

export const configMakeNewPath = (oldDirPath: string, newDirPath: string) => {
  return (filePath: string) => baseMakeNewPath(filePath, oldDirPath, newDirPath);
};
export type MakeNewPath = ReturnType<typeof configMakeNewPath>;

export type FullPath = string;
export type RelativePath = string;

export function getDirname(functionWrappers: number = 1): string {
  const stack = callsites();
  const callSiteFilePath = stack[functionWrappers].getFileName();
  if (callSiteFilePath === null) throw Error();
  return path.dirname(callSiteFilePath);
}

export const getFullPaths = (dirPath: string) => {
  const fileNames: FullPath[] = [];
  const files: fs.Dirent[] = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    if (file.isFile()) {
      fileNames.push(fullPath);
    } else if (file.isDirectory()) {
      const _fileNames = getFullPaths(fullPath);
      fileNames.push(..._fileNames);
    }
  }
  return fileNames;
};

export type PosixPath = string; // path with forward slashes.

export const posixify = (filePath: string): PosixPath => {
  return filePath.split(path.sep).join(path.posix.sep);
};
export type Posixify = typeof posixify;

type Config = { dirPath?: FullPath; posix?: boolean };
export const configMakeAbsolute = (config: Config = {}) => {
  const defaultConfig = { dirPath: getDirname(2), posix: false };
  const configFilled = fillDefaults(defaultConfig, config);
  const { dirPath, posix } = configFilled;
  const doNothing = (relPath: string) => relPath;
  const handlePosix = posix ? posixify : doNothing;

  return (relPath: RelativePath) => {
    const absPath = path.resolve(dirPath, relPath);
    return handlePosix(absPath);
  };
};
type ConfigMakeAbsolute = typeof configMakeAbsolute;
export type MakeAbsolute = ReturnType<ConfigMakeAbsolute>;
