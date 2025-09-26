import * as path from 'path';
import { Project, ts } from "ts-morph";

const makeCliConfig = () => {
  return {
    tsConfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
  };
};

const makeTestConfig = () => {
  const { tsConfigFilePath } = makeCliConfig();
  const { config } = ts.readConfigFile(tsConfigFilePath, ts.sys.readFile);
  return {
    compilerOptions: config.compilerOptions,
  };
};

export const makeTestProject = () => {
  const config = makeTestConfig();
  return new Project(config);
}