import { invalidate, withAdmin } from "@/server/api/http";
import { saveUpload } from "@/server/cms/uploads";

/** POST /api/admin/media/upload — multipart form: file (image ≤ 8 MB), folder? */
export const POST = withAdmin(async (request) => {
  const form = await request.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "uploads");
  if (!(file instanceof File)) {
    return Response.json({ error: { code: "bad_request", message: "Thiếu tệp tải lên." } }, { status: 400 });
  }
  const asset = await saveUpload(file, folder);
  invalidate("media");
  return Response.json({ data: asset }, { status: 201 });
});
