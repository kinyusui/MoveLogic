import { vi } from "vitest";

class WorkspaceEdit {
  deleteFile = vi.fn();
}

vi.mock("vscode", () => ({
  window: {
    showErrorMessage: vi.fn(),
    createOutputChannel: vi.fn(),
  },
  workspace: {
    fs: {},
    getWorkspaceFolder: () => {},
    applyEdit: vi.fn(),
  },
  WorkspaceEdit: WorkspaceEdit,
  Uri: { file: vi.fn() },
  // Add other mocked APIs
}));
