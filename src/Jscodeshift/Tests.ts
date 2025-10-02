import * as path from "path";

const end = "e:/Code/Bob/Here";
const makePathPossible = (filePath: string) => {
  if (filePath === "e:/") return;

  const dirPath = path.dirname(filePath);
  console.log(dirPath);
  makePathPossible(dirPath);
};
makePathPossible(end);
