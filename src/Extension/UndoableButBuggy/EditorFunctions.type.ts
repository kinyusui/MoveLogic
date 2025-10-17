export interface EditorFunctions {
  renameFile: (startPath: string, endPath: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  // applyEdit: () => Promise<void>;
}
