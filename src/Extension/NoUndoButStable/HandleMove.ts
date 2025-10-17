import { HandleMove } from "../HandleMove.js";
import { SystemControl } from "../SystemTypes.type.js";
import { configStableEdit } from "./Edit.js";

export const configHandleMove = (systemControl: SystemControl) => {
  // const undoableEdit = configUndoableEdit();
  const editor = configStableEdit();
  return new HandleMove({
    ...systemControl,
    configEditor: configStableEdit,
    editor: editor,
  });
};
