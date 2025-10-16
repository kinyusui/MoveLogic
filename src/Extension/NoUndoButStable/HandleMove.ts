import { configStableEdit } from "../../vscodeFunctions/Editor/Edit.js";
import { HandleMove } from "../HandleMove.js";
import { SystemControl } from "../SystemTypes.type.js";

export const configHandleMove = (systemControl: SystemControl) => {
  // const undoableEdit = configUndoableEdit();
  const editor = configStableEdit();
  return new HandleMove({
    ...systemControl,
    configEditor: configStableEdit,
    editor: editor,
  });
};
