import { HandleMove } from "../HandleMove.js";
import { SystemControl } from "../SystemTypes.type.js";
import { configUndoableEdit } from "./UndoableEdit.js";

export const configHandleMove = (systemControl: SystemControl) => {
  // const undoableEdit = configUndoableEdit();
  const editor = configUndoableEdit();
  return new HandleMove({
    ...systemControl,
    configEditor: configUndoableEdit,
    editor: editor,
  });
};
