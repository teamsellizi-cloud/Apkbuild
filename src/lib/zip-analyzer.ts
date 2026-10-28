import JSZip from "jszip";
import { ZipAnalysisResult } from "@/types";

const MAX_ZIP_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_EXTRACTED_SIZE_BYTES = 250 * 1024 * 1024; // 250MB
const MAX_FILE_COUNT = 5000;

export async function analyzeZipBuffer(
  buffer: ArrayBuffer | Buffer,
  fileName: string
): Promise<ZipAnalysisResult> {
  const result: ZipAnalysisResult = {
    fileName,
    fileSize: buffer.byteLength,
    fileCount: 0,
    isSafe: true,
    hasIndexHtml: false,
    hasPackageJson: false,
    packageManager: "none",
    buildScriptDetected: false,
    fileTree: [],
  };

  if (buffer.byteLength > MAX_ZIP_SIZE_BYTES) {
    result.isSafe = false;
    result.error = `ZIP file size (${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 50MB.`;
    return result;
  }

  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(buffer);

    let totalExtractedSize = 0;
    let fileCount = 0;
    const paths: string[] = [];

    // Check every file entry for safety & path traversal
    for (const [relativePath, file] of Object.entries(loadedZip.files)) {
      fileCount++;

      // Path traversal check
      if (
        relativePath.includes("../") ||
        relativePath.includes("..\\") ||
        relativePath.startsWith("/") ||
        relativePath.startsWith("\\")
      ) {
        result.isSafe = false;
        result.error = `Security violation: Path traversal detected in entry "${relativePath}".`;
        return result;
      }

      if (fileCount > MAX_FILE_COUNT) {
        result.isSafe = false;
        result.error = `ZIP contains too many files (> ${MAX_FILE_COUNT}). Please remove node_modules or large folders.`;
        return result;
      }

      // Check extracted size
      // @ts-expect-error JSZip internal size property
      const uncompressedSize = file._data ? file._data.uncompressedSize || 0 : 0;
      totalExtractedSize += uncompressedSize;

      if (totalExtractedSize > MAX_EXTRACTED_SIZE_BYTES) {
        result.isSafe = false;
        result.error = "Extracted contents exceed 250MB limit (Decompression safety trigger).";
        return result;
      }

      if (!file.dir) {
        paths.push(relativePath);
      }
    }

    result.fileCount = fileCount;
    result.fileTree = paths.slice(0, 50); // Preview top 50 files

    // Check for index.html
    const indexFile = paths.find(
      (p) =>
        p.toLowerCase() === "index.html" ||
        p.toLowerCase().endsWith("/index.html") ||
        p.toLowerCase() === "public/index.html" ||
        p.toLowerCase() === "dist/index.html"
    );

    if (indexFile) {
      result.hasIndexHtml = true;
      result.indexPath = indexFile;
    }

    // Check for lockfiles / package manager
    if (paths.some((p) => p.endsWith("pnpm-lock.yaml"))) {
      result.packageManager = "pnpm";
    } else if (paths.some((p) => p.endsWith("yarn.lock"))) {
      result.packageManager = "yarn";
    } else if (paths.some((p) => p.endsWith("package-lock.json") || p.endsWith("package.json"))) {
      result.packageManager = "npm";
    }

    // Check for package.json
    const packageJsonFile = loadedZip.file("package.json");
    if (packageJsonFile) {
      result.hasPackageJson = true;
      try {
        const contentStr = await packageJsonFile.async("string");
        const pkg = JSON.parse(contentStr);

        const scripts = pkg.scripts || {};
        if (scripts.build) {
          result.buildScriptDetected = true;
          result.buildCommand = `${result.packageManager === "yarn" ? "yarn" : result.packageManager === "pnpm" ? "pnpm" : "npm run"} build`;
        }

        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

        if (deps["vite"]) {
          result.frameworkDetected = "Vite App";
          result.distDirDetected = "dist";
        } else if (deps["next"]) {
          result.frameworkDetected = "Next.js (Static Export)";
          result.distDirDetected = "out";
        } else if (deps["astro"]) {
          result.frameworkDetected = "Astro";
          result.distDirDetected = "dist";
        } else if (deps["@angular/core"]) {
          result.frameworkDetected = "Angular";
          result.distDirDetected = "dist";
        } else if (deps["react-scripts"]) {
          result.frameworkDetected = "Create React App";
          result.distDirDetected = "build";
        } else if (deps["vue"]) {
          result.frameworkDetected = "Vue SPA";
          result.distDirDetected = "dist";
        } else if (deps["svelte"]) {
          result.frameworkDetected = "Svelte / SvelteKit";
          result.distDirDetected = "build";
        } else {
          result.frameworkDetected = "Node.js Web App";
        }
      } catch {
        result.frameworkDetected = "Custom Web App (Unparseable package.json)";
      }
    } else if (result.hasIndexHtml) {
      result.frameworkDetected = "Static HTML / JavaScript";
    } else {
      result.error =
        "No 'index.html' or 'package.json' found. Ensure your zip contains an index.html file or a standard web project.";
    }
  } catch (err: unknown) {
    const error = err as Error;
    result.isSafe = false;
    result.error = `Failed to parse ZIP archive: ${error.message}`;
  }

  return result;
}
