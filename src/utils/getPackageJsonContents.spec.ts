import { describe, it, expect, vi } from "vitest";
import unzipper from "unzipper";
import { getPackageJsonContents } from "./getPackageJsonContents.ts";

vi.mock("unzipper");

describe(getPackageJsonContents.name, () => {
  const mockZipPath = "/path/to/file.zip";
  const mockPackageJson = '{"name":"test"}';

  it("returns package.json contents from zip", async () => {
    const mockBuffer = Buffer.from(mockPackageJson);
    const mockFiles = [
      {
        path: "package.json",
        buffer: vi.fn().mockResolvedValue(mockBuffer),
      },
    ];
    vi.mocked(unzipper.Open.file).mockResolvedValue({ files: mockFiles } as any);

    const result = await getPackageJsonContents(mockZipPath);

    expect(result).toEqual([mockPackageJson]);
  });

  it("skips node_modules directory", async () => {
    const mockFiles = [
      {
        path: "node_modules/package.json",
        buffer: vi.fn(),
      },
      {
        path: "package.json",
        buffer: vi.fn().mockResolvedValue(Buffer.from(mockPackageJson)),
      },
    ];
    vi.mocked(unzipper.Open.file).mockResolvedValue({ files: mockFiles } as any);

    const result = await getPackageJsonContents(mockZipPath);

    expect(result).toEqual([mockPackageJson]);
    expect(mockFiles[0].buffer).not.toHaveBeenCalled();
  });

  it("skips non-package.json files", async () => {
    const mockFiles = [
      {
        path: "index.js",
        buffer: vi.fn(),
      },
    ];
    vi.mocked(unzipper.Open.file).mockResolvedValue({ files: mockFiles } as any);

    const result = await getPackageJsonContents(mockZipPath);

    expect(result).toEqual([]);
  });

  it("returns multiple package.json files", async () => {
    const mockFiles = [
      {
        path: "package.json",
        buffer: vi.fn().mockResolvedValue(Buffer.from('{"name":"root"}')),
      },
      {
        path: "packages/app/package.json",
        buffer: vi.fn().mockResolvedValue(Buffer.from('{"name":"app"}')),
      },
    ];
    vi.mocked(unzipper.Open.file).mockResolvedValue({ files: mockFiles } as any);

    const result = await getPackageJsonContents(mockZipPath);

    expect(result).toEqual(['{"name":"root"}', '{"name":"app"}']);
  });
});
