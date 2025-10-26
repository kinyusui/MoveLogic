import fs from "fs-extra";
import path from "path";
import * as vscode from "vscode";
import { QuickPickElement } from "../Extension/SystemTypes.type.js";
import { Posixify, posixify } from "../Nonvscode/makePath.js";
import { SortPaths, SortPathsManager } from "../Nonvscode/Sort.js";

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

export const toSuggestionFormat = (pathStr: string) => {
  const otherSep = path.sep ? `\\` : "/";
  const parts = pathStr.split(otherSep);
  return path.join(...parts);
};

class SearchPaths {
  constructor(
    public props: {
      pushLimit: number;
      pushWithLimit: PushWithLimit;
      posixify: Posixify;
      sortPaths: SortPaths;
    }
  ) {}
  recursiveSearch = (rootDir: string, totalPaths: string[]) => {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory());
    const dirPaths = directories.map((entry) => makeFullPath(rootDir, entry.name));
    const { pushWithLimit } = this.props;
    totalPaths = pushWithLimit.push(totalPaths, dirPaths);

    for (const dirPath of dirPaths) {
      if (pushWithLimit.limitReached(totalPaths.length)) break;
      this.recursiveSearch(dirPath, totalPaths);
    }
    return totalPaths;
  };

  startRecursiveSearch = (dirPath: string) => {
    const dirPathFormatted = toSuggestionFormat(dirPath);
    let totalPaths: string[] = [dirPathFormatted];
    this.props.pushWithLimit = new PushWithLimit(this.props.pushLimit);
    totalPaths = this.recursiveSearch(dirPath, totalPaths);
    return totalPaths.map((label) => ({ label }));
  };

  startShallowSearch = (dirPath: string) => {
    const dirPathFormatted = toSuggestionFormat(dirPath);
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const filePaths = entries.map((entry) => makeFullPath(dirPath, entry.name));

    filePaths.push(dirPathFormatted);
    return filePaths.map((label) => ({ label }));
  };
}

const configSearchPaths = ({ pushLimit }: { pushLimit: number }) => {
  const pushWithLimit = new PushWithLimit(pushLimit);
  return new SearchPaths({
    pushLimit,
    pushWithLimit,
    posixify: posixify,
    sortPaths: SortPathsManager.sort,
  });
};

const searchPathsLimit100 = configSearchPaths({ pushLimit: 100 });

const trueDirName = (dirPath: string) => {
  const endsWithSlash = dirPath[dirPath.length - 1] === "/";
  if (endsWithSlash) {
    dirPath = dirPath.slice(0, -1);
  }
  return dirPath; //path.dirname(dirPath);
};

export type Resolve = (path: string) => void;

const makeOnDidAccept = (quickPick: QuickPickElement, resolve: Resolve) => {
  return () => {
    const selected = quickPick.selectedItems[0]?.label;
    const value = quickPick.value;
    if (selected === undefined) resolve(value);

    const selectedStartsWithValue = selected.slice(0, value.length) === value;
    const finalValue = selectedStartsWithValue ? selected : value;
    quickPick.hide();
    resolve(finalValue);
  };
};

type Props = {
  searchPaths: SearchPaths;
};

export class MyQuickPick {
  quickPick: QuickPickElement;
  constructor(public props: Props) {
    this.quickPick = this.makeSkeleton();
  }

  updateItems = (pathName: string) => {
    const posixifiedPath = posixify(pathName);
    const dir = trueDirName(posixifiedPath);
    const allOptions = this.props.searchPaths.startShallowSearch(dir);
    const { quickPick } = this;
    quickPick.items = allOptions;
    if (quickPick.items.length === 0) {
      quickPick.selectedItems = [];
      quickPick.activeItems = [];
    }
  };

  getInput = async (startPath: string) => {
    const { quickPick } = this;
    quickPick.value = startPath;
    const input = new Promise((resolve: Resolve) => {
      const onDidAccept = makeOnDidAccept(quickPick, resolve);
      quickPick.onDidAccept(onDidAccept);
      this.updateItems(startPath);
    });
    return await input;
  };

  makeSkeleton = () => {
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = "Enter new path for file/folder";

    quickPick.onDidChangeValue(this.updateItems);

    quickPick.ignoreFocusOut = true;
    return quickPick;
  };

  show = () => this.quickPick.show();
  hide = () => this.quickPick.hide();
}

export const configMyQuickPick = () => {
  return new MyQuickPick({
    searchPaths: searchPathsLimit100,
  });
};
