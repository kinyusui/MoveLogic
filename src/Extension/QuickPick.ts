import * as vscode from "vscode";

type ActiveQuickPick = vscode.QuickPick<vscode.QuickPickItem> | undefined;

export const handleUseSuggest = (activeQuickPick: ActiveQuickPick) => {
  // This is the logic that runs when the user presses Tab.
  if (!activeQuickPick) {
    return; // No active QuickPick, do nothing.
  }

  // Get the currently highlighted item.
  const activeItem = activeQuickPick.activeItems[0];

  if (activeItem) {
    // Overwrite the input box's value with the active item's label.
    activeQuickPick.value = activeItem.label;
  }
};

// export function registerQuickPickCommands(
//   context: vscode.ExtensionContext,
//   activeQuickPick: ActiveQuickPick
// ) {
//   const disposable = vscode.commands.registerCommand(
//     "tsMoveHelper.acceptQuickPickSuggestion",
//     () => register(activeQuickPick)
//   );

//   context.subscriptions.push(disposable);
// }
