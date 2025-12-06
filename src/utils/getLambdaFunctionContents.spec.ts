import { describe, it, expect, vi } from "vitest";
import unzipper from "unzipper";
import { getLambdaFunctionContents } from "./getLambdaFunctionContents.ts";

vi.mock("unzipper");

describe(getLambdaFunctionContents.name, () => {
  const mockZipPath = "/path/to/file.zip";
  const mockPackageJson = '{"name":"test"}';

  it("returns bundleContent for single file", async () => {
    const mockFiles = [
      {
        type: "File",
        buffer: vi.fn().mockResolvedValue(Buffer.from("bundle content")),
      },
    ];
    vi.mocked(unzipper.Open.file).mockResolvedValue({ files: mockFiles } as any);

    const result = await getLambdaFunctionContents(mockZipPath);

    expect(result).toEqual({ bundleContent: "bundle content" });
  });

  it("returns packageJsonContents for multiple files", async () => {
    const mockFiles = [
      {
        type: "File",
        path: "package.json",
        buffer: vi.fn().mockResolvedValue(Buffer.from(mockPackageJson)),
      },
      {
        type: "File",
        path: "index.js",
        buffer: vi.fn(),
      },
    ];
    vi.mocked(unzipper.Open.file).mockResolvedValue({ files: mockFiles } as any);

    const result = await getLambdaFunctionContents(mockZipPath);

    expect(result).toEqual({ packageJsonContents: [mockPackageJson] });
  });

  it("skips node_modules directory", async () => {
    const mockFiles = [
      {
        type: "File",
        path: "node_modules/package.json",
        buffer: vi.fn(),
      },
      {
        type: "File",
        path: "package.json",
        buffer: vi.fn().mockResolvedValue(Buffer.from(mockPackageJson)),
      },
    ];
    vi.mocked(unzipper.Open.file).mockResolvedValue({ files: mockFiles } as any);

    const result = await getLambdaFunctionContents(mockZipPath);

    expect(result).toEqual({ packageJsonContents: [mockPackageJson] });
    expect(mockFiles[0].buffer).not.toHaveBeenCalled();
  });

  it("returns multiple package.json files", async () => {
    const mockFiles = [
      {
        type: "File",
        path: "package.json",
        buffer: vi.fn().mockResolvedValue(Buffer.from('{"name":"root"}')),
      },
      {
        type: "File",
        path: "packages/app/package.json",
        buffer: vi.fn().mockResolvedValue(Buffer.from('{"name":"app"}')),
      },
    ];
    vi.mocked(unzipper.Open.file).mockResolvedValue({ files: mockFiles } as any);

    const result = await getLambdaFunctionContents(mockZipPath);

    expect(result).toEqual({ packageJsonContents: ['{"name":"root"}', '{"name":"app"}'] });
  });
});
