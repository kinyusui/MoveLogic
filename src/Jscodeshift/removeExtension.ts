import * as path from "path";

export const removeExtension = (itemPath: string): string => {
  const pathParts = itemPath.split(path.sep);
  if (pathParts.length === 1) return itemPath;

  const lastPart = pathParts[pathParts.length - 1];
  const validLastPart = lastPart.split(".")[0];
  pathParts[pathParts.length - 1] = validLastPart;
  return pathParts.join(path.sep);
};
