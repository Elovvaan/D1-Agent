import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

const allowedExtensions: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webm": "video/webm",
  ".webp": "image/webp"
};

function cleanFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "");
}

function contentTypeFor(fileName: string) {
  const lower = fileName.toLowerCase();
  const extension = Object.keys(allowedExtensions).find((item) => lower.endsWith(item));
  return extension ? allowedExtensions[extension] : "application/octet-stream";
}

export async function GET(_request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await params;
  const safeName = cleanFileName(fileName);
  if (!safeName || safeName !== fileName) return new NextResponse("Not found", { status: 404 });

  const filePath = resolve(process.cwd(), "..", "data", "user-state", "uploads", safeName);
  if (!existsSync(filePath)) return new NextResponse("Not found", { status: 404 });

  const body = await readFile(filePath);
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentTypeFor(safeName),
      "Cache-Control": "no-store"
    }
  });
}
