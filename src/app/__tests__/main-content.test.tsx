import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <>{children}</>,
  useFileSystem: () => ({
    getNode: () => null,
    selectedFile: null,
    selectFile: vi.fn(),
  }),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <>{children}</>,
  useChat: () => ({
    messages: [],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">PreviewFrame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">HeaderActions</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("renders Preview view by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking the Code tab shows the code editor", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  const codeTab = screen.getByRole("tab", { name: "Code" });
  await user.click(codeTab);

  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("clicking the Preview tab returns to preview view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeDefined();

  await user.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("the active tab reflects the current view via aria-selected", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  const codeTab = screen.getByRole("tab", { name: "Code" });

  expect(previewTab.getAttribute("aria-selected")).toBe("true");
  expect(codeTab.getAttribute("aria-selected")).toBe("false");

  await user.click(codeTab);

  expect(codeTab.getAttribute("aria-selected")).toBe("true");
  expect(previewTab.getAttribute("aria-selected")).toBe("false");
});
