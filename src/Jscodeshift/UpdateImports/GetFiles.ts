import fg from "fast-glob";
import { configWorkspaceFs, WorkspaceFs } from "../../vscodeFunctions/WorkspaceFs.js";

type MatchSettings = {
  ignore: string[];
  cwd: string;
};

const getFiles = async (
  includes: string[],
  excludes: string[],
  workspaceFs: WorkspaceFs
): Promise<string[]> => {
  // Limit concurrency to avoid EMFILE (too many open files) on large workspaces.
  // fast-glob performs many parallel fs operations; setting `concurrency` and
  // `onlyFiles` keeps resource usage lower and results stable.
  const matchSettings = {
    ignore: excludes,
    cwd: workspaceFs.workspaceRoot,
    onlyFiles: true,
    concurrency: 20,
  } as const;
  const files: string[] = [];
  for (const pattern of includes) {
    const found: string[] = await fg(pattern, matchSettings);
    files.push(...found);
  }
  return files.map((f) => workspaceFs.resolve(f));
};

export const getProjectFiles = async () => {
  const includes = ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"];
  const excludes = ["**/node_modules/**"];
  const workspaceFs = configWorkspaceFs();
  return await getFiles(includes, excludes, workspaceFs);
};
