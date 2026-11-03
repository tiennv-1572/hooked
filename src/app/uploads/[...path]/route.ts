import { readUpload } from "@/server/cms/uploads";

type Context = { params: Promise<{ path: string[] }> };

/** GET /uploads/<yyyy>/<mm>/<file> — images uploaded through the CMS media library. */
export async function GET(_request: Request, { params }: Context) {
  const file = await readUpload((await params).path);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.size),
      "Last-Modified": file.mtime.toUTCString(),
      // File names contain a random suffix, so they never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...(file.mime === "image/svg+xml"
        ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" }
        : {}),
    },
  });
}
