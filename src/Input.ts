import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { QuickPickElement } from "./Extension/SystemTypes";
import { posixify } from "./makePath";

const makeFullPath = (dirPath: string, fileName: string) => {
  return path.join(dirPath, fileName);
};

class PushWithLimit {
  constructor(public limit: number) {}
  push = (container: string[], items: string[]) => {
    for (const item of items) {
      const containerFull = container.length >= this.limit;
      if (containerFull) break;

      container.push(item);
    }
    return container;
  };

  limitReached = (itemSize: number) => itemSize >= this.limit;
}

const configRecursiveSearch = (pushWithLimit: PushWithLimit) => {
  const recursiveSearch = (rootDir: string, totalPaths: string[]) => {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory());
    const dirPaths = directories.map((entry) => makeFullPath(rootDir, entry.name));
    totalPaths = pushWithLimit.push(totalPaths, dirPaths);

    for (const dirPath of dirPaths) {
      if (pushWithLimit.limitReached(totalPaths.length)) break;
      recursiveSearch(dirPath, totalPaths);
    }
    return totalPaths;
  };
  return recursiveSearch;
};
const pushWithLimit100 = new PushWithLimit(100);
const recursiveSearchLimit100 = configRecursiveSearch(pushWithLimit100);

function getAllDirectories(rootDir: string): string[] {
  // recursively gather all directories under rootDir
  let totalPaths: string[] = [];
  totalPaths = recursiveSearchLimit100(rootDir, totalPaths);
  return totalPaths;
}

const trueDirName = (dirPath: string) => {
  const willSkip = dirPath[dirPath.length - 1] === "/";
  if (willSkip) {
    dirPath = dirPath.slice(0, -1);
  }
  return path.dirname(dirPath);
};

export type Resolve = (path: string) => void;

const makeOnDidAccept = (quickPick: QuickPickElement, resolve: Resolve) => {
  return () => {
    const selected = quickPick.selectedItems[0]?.label ?? quickPick.value;
    quickPick.hide();
    resolve(selected);
  };
};

export class MyQuickPick {
  constructor(public quickPick: QuickPickElement = MyQuickPick.makeSkeleton()) {}
  getInput = async (startPath: string) => {
    const { quickPick } = this;
    quickPick.value = startPath;
    const input = new Promise((resolve: Resolve) => {
      const onDidAccept = makeOnDidAccept(quickPick, resolve);
      quickPick.onDidAccept(onDidAccept);
    });
    return await input;
  };

  static makeSkeleton = () => {
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = "Enter new path for file/folder";

    quickPick.onDidChangeValue((pathName: string) => {
      const posixifiedPath = posixify(pathName);
      const dir = trueDirName(posixifiedPath);
      const allOptions = getAllDirectories(dir);
      quickPick.items = allOptions.map((label) => ({ label }));
    });

    quickPick.ignoreFocusOut = true;
    return quickPick;
  };

  show = () => this.quickPick.show();
  hide = () => this.quickPick.hide();
}

export const makeMyQuickPick = () => {
  return new MyQuickPick();
};
