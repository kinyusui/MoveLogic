import { vi } from "vitest";
vi.mock("vscode", () => ({
  window: {
    showErrorMessage: vi.fn(),
    createOutputChannel: vi.fn(),
  },
  Uri: { file: vi.fn() },
  // Add other mocked APIs
}));
