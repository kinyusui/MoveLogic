import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { posixify } from "./makePath";

const makeFullPath = (dirPath: string, fileName: string) => {
  return path.join(dirPath, fileName);
}


class PushWithLimit {
  constructor(public limit: number) {}
  push = (container: string[], items: string[]) => {
    for (const item of items) {
      const containerFull = container.length >= this.limit;
      if (containerFull) break;

      container.push(item);     
    }
    return container;
  }

  limitReached = (itemSize: number) => itemSize >= this.limit;
}

const configRecursiveSearch = (pushWithLimit: PushWithLimit) => {
  const recursiveSearch = (rootDir: string, totalPaths: string[]) => {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    const dirPaths = directories.map((entry) => makeFullPath(rootDir, entry.name));
    totalPaths = pushWithLimit.push(totalPaths, dirPaths)

    for (const dirPath of dirPaths) {
      if (pushWithLimit.limitReached(totalPaths.length)) break;
      recursiveSearch(dirPath, totalPaths);
    }
    return totalPaths;
  }
  return recursiveSearch;
}
const pushWithLimit100 = new PushWithLimit(100);
const recursiveSearch = configRecursiveSearch(pushWithLimit100);

function getAllDirectories(rootDir: string): string[] {
  // recursively gather all directories under rootDir
  let totalPaths: string[] = [];
  totalPaths = recursiveSearch(rootDir, totalPaths);
  return totalPaths;
}


const trueDirName = (dirPath: string) => {
  const willSkip = dirPath[dirPath.length-1] === '/';
  if (willSkip) {
    dirPath = dirPath.slice(0, -1);
  }
  return path.dirname(dirPath);
}

export type Retrieve = (path: string) => void;

export const letQuickPickHandleInput = (currentPath: string, retrieve: Retrieve) => {
  const quickPick = vscode.window.createQuickPick();
  quickPick.placeholder = "Enter new path for file/folder";
  quickPick.value = currentPath;

  quickPick.onDidChangeValue((pathName: string) => {
    const posixifiedPath = posixify(pathName);
    const dir = trueDirName(posixifiedPath);
    const allOptions = getAllDirectories(dir);
    quickPick.items = allOptions.map(label => ({ label }));
    vscode.window.showInformationMessage(`path: ${pathName}, posix: ${posixifiedPath} ___ ${JSON.stringify(quickPick.items)}`)
  });

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0]?.label ?? quickPick.value;
    quickPick.hide();
    retrieve(selected);
  });

  quickPick.show();
}