import callsites from "callsites";
import { Dirent } from "fs";
import fs from "fs-extra";
import path from "path";
import { fillDefaults } from "./Dict.js";

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

const tsTypes = new Set(["ts", "tsx", "js", "jsx"]);
type FileLike = Dirent | string;
export const getExtension = (basename: string) => {
  const nameParts = basename.split(".");
  if (nameParts.length < 2) return "";

  return nameParts[nameParts.length - 1];
};

const checkIsTargetFile = (file: FileLike, targetTypes: Set<string>) => {
  const basename = file instanceof Dirent ? file.name : path.basename(file);
  const extension = getExtension(basename);
  return targetTypes.has(extension);
};

const configCheckIsTargetFile = (targetTypes: Set<string>) => {
  return (file: FileLike) => checkIsTargetFile(file, targetTypes);
};
type ConfigCheckIsTargetFile = typeof configCheckIsTargetFile;

export const checkIsTsLike = configCheckIsTargetFile(tsTypes);
export type CheckIsTargetFile = typeof checkIsTsLike;

export const getFullPaths = (dirPath: string, checkIsTargetFile: CheckIsTargetFile) => {
  const filePaths: FullPath[] = [];
  const files: fs.Dirent[] = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    if (file.isFile()) {
      const isTargetFile = checkIsTargetFile(file);
      if (!isTargetFile) continue;
      filePaths.push(fullPath);
    } else if (file.isDirectory()) {
      const _fileNames = getFullPaths(fullPath, checkIsTargetFile);
      filePaths.push(..._fileNames);
    }
  }
  return filePaths;
};

export const configGetFullPaths = (checkIsTargetFile: CheckIsTargetFile) => {
  return (dirPath: string) => getFullPaths(dirPath, checkIsTargetFile);
};

const alwaysTrue = (file: FileLike) => true;
export const getFullPathsAny = configGetFullPaths(alwaysTrue);
export const getFullTsPaths = configGetFullPaths(checkIsTsLike);

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

export class RemoveExtensionFrom {
  static fileName(fileName: string) {
    const nameParts = fileName.split(".");
    const noExtension = nameParts.length < 2;
    if (noExtension) return fileName;
    nameParts.pop();
    return nameParts.join(".");
  }

  static fullFilePath = (itemPath: string): string => {
    const pathParts = itemPath.split(path.sep);
    const lastPart = pathParts[pathParts.length - 1];
    const validLastPart = RemoveExtensionFrom.fileName(lastPart);
    pathParts[pathParts.length - 1] = validLastPart;
    return pathParts.join(path.sep);
  };
}
