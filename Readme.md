Really basic it just moves multiple ts files.

# How To Use: Step By Step.

1. Right click a file/dir to select `Move Typescript File/Dir` option.
   1. You can select multiple files and dirs by holding `ctrl` key.
2. Write in path to dir you want the selected items to belong in.
   1. You can press tab to fill in a focused suggestion.
      1. Focus on a suggestion by using up/down key to get to it.

# Development

1. Uninstall official TS Move extension so development will work.
2. Launch project and the default tasks should automatically run.
3. Entry is specified in package.json.
4. Helpers are.
   "compile_watch": "tsc -watch -p ./".
   "testCompile": "npm run compile && npm run lint".

# Publish Extension

1. `npm run publish`.
   1. It will run `vsce publish`.
   2. Which will trigger `vscode:prepublish`.
   3. Which will trigger `compile`.
