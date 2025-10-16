import { configUndoableEdit } from "../../vscodeFunctions/Editor/UndoableEdit.js";
import { HandleMove } from "../HandleMove.js";
import { SystemControl } from "../SystemTypes.type.js";

export const configHandleMove = (systemControl: SystemControl) => {
  // const undoableEdit = configUndoableEdit();
  const editor = configUndoableEdit();
  return new HandleMove({
    ...systemControl,
    configEditor: configUndoableEdit,
    editor: editor,
  });
};
