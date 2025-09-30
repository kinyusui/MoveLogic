import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';

const makeFullPath = (dirPath: string, fileName: string) => {
  return path.join(dirPath, fileName);
}



const configPushWithLimit = (limit=100) => {
  const pushWithLimit = (container: string[], items: string[]) => {
    for (const item of items) {
      const containerFull = container.length >= limit;
      if (containerFull) break;

      container.push(item);     
    }
    return container;
  }
  return pushWithLimit;
};
const pushLimit100 = configPushWithLimit(100);
type PushWithLimit = ReturnType<typeof configPushWithLimit>;

const configRecursiveSearch = (pushWithLimit: PushWithLimit) => {
  const recursiveSearch = (rootDir: string, totalPaths: string[]) => {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    const dirPaths = directories.map((entry) => makeFullPath(rootDir, entry.name));
    totalPaths = pushWithLimit(totalPaths, dirPaths)

    for (const dirPath of dirPaths) {
      if (totalPaths.length > 100) break;
      recursiveSearch(dirPath, totalPaths);
    }
    return totalPaths;
  }
  return recursiveSearch;
}

const recursiveSearch = configRecursiveSearch(pushLimit100);

function getAllDirectories(rootDir: string): string[] {
  // recursively gather all directories under rootDir
  const start = performance.now();
  let totalPaths: string[] = [];
  totalPaths = recursiveSearch(rootDir, totalPaths);
  const time = performance.now() - start;
  const message = `Search took: ${time}. `
    + `\ntotalPaths: ${totalPaths.length}.`
    + `\nSearch of ${rootDir}.`;
  vscode.window.showInformationMessage(message);
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
    const dir = trueDirName(pathName);
    const allOptions = getAllDirectories(dir);
    quickPick.items = allOptions.map(label => ({ label }));
  });

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0]?.label ?? quickPick.value;
    quickPick.hide();
    retrieve(selected);
  });

  quickPick.show();
}