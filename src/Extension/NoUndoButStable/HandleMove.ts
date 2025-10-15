import { configUndoableEdit } from "../../vscodeFunctions/Editor/Edit";
import { HandleMove } from "../HandleMove";
import { SystemControl } from "../SystemTypes.type";

export const configHandleMove = (systemControl: SystemControl) => {
  // const undoableEdit = configUndoableEdit();
  const editor = configUndoableEdit();
  return new HandleMove({
    ...systemControl,
    configEditor: configUndoableEdit,
    editor: editor,
  });
};
