import fg from "fast-glob";
import { configWorkspaceFs, WorkspaceFs } from "../../WorkspaceFs/WorkspaceFs";

type MatchSettings = {
  ignore: string[];
  cwd: string;
};

const getFiles = async (
  includes: string[],
  excludes: string[],
  workspaceFs: WorkspaceFs
): Promise<string[]> => {
  const matchSettings = {
    ignore: excludes,
    cwd: workspaceFs.workspaceRoot,
  };
  const files: string[] = [];
  for (const pattern of includes) {
    const found: string[] = await fg(pattern, matchSettings);
    files.push(...found);
  }
  return files.map((f) => workspaceFs.resolve(f));
};

export const getProjectFiles = async () => {
  const includes = ["**/*.ts", "**/*.tsx"];
  const excludes = ["**/node_modules/**"];
  const workspaceFs = configWorkspaceFs();
  return getFiles(includes, excludes, workspaceFs);
};
