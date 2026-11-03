import { buildOpenApiSpec } from "@/server/openapi/spec";

/** GET /api/v1/openapi.json — OpenAPI 3.1 document of the public API. */
export function GET() {
  return Response.json(buildOpenApiSpec(process.env.NEXT_PUBLIC_SITE_URL), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
