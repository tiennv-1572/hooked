/**
 * GET /api-docs — Swagger UI for the public API (loads swagger-ui-dist from a pinned CDN version).
 * The admin API is internal and intentionally not listed.
 */
const SWAGGER_VERSION = "5.17.14";

export function GET() {
  const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hooked API · Swagger</title>
  <link rel="icon" href="/icon.svg" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar-hooked { display: flex; align-items: center; gap: 12px; padding: 14px 24px; background: #050101; color: #fff; font: 600 15px system-ui, sans-serif; }
    .topbar-hooked span { color: #ff6b00; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .opblock-tag { font-size: 18px; }
  </style>
</head>
<body>
  <div class="topbar-hooked"><span>HOOKED</span> Public API v1 — <a style="color:#ccc" href="/api/v1/openapi.json">openapi.json</a></div>
  <div id="swagger"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/api/v1/openapi.json",
      dom_id: "#swagger",
      deepLinking: true,
      docExpansion: "list",
      defaultModelsExpandDepth: 0,
      tryItOutEnabled: true,
      displayRequestDuration: true,
    });
  </script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
