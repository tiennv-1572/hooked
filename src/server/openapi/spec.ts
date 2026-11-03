/**
 * OpenAPI 3.1 document of the PUBLIC website API (/api/v1). The admin API (/api/admin) is internal and not documented here.
 * Served at /api/v1/openapi.json and rendered by Swagger UI at /api-docs.
 */

type Schema = Record<string, unknown>;

const ref = (name: string): Schema => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (items: Schema): Schema => ({ type: "array", items });
const str = (description?: string, example?: unknown): Schema => ({
  type: "string",
  ...(description ? { description } : {}),
  ...(example !== undefined ? { example } : {}),
});
const nullable = (schema: Schema): Schema => ({ oneOf: [schema, { type: "null" }] });
const obj = (properties: Record<string, Schema>, required = Object.keys(properties)): Schema => ({
  type: "object",
  properties,
  required,
});

const dataEnvelope = (data: Schema, meta?: Schema): Schema => obj(meta ? { data, meta } : { data });

const ok = (description: string, data: Schema, meta?: Schema) => ({
  description,
  content: { "application/json": { schema: dataEnvelope(data, meta) } },
});

const errors = {
  404: { description: "Không tìm thấy", content: { "application/json": { schema: ref("Error") } } },
  422: {
    description: "Dữ liệu không hợp lệ (kèm lỗi từng trường)",
    content: { "application/json": { schema: ref("Error") } },
  },
  429: {
    description: "Gửi quá nhiều lần (5 lần / 10 phút / IP)",
    content: { "application/json": { schema: ref("Error") } },
  },
  500: {
    description: "Lỗi máy chủ / không kết nối được MySQL",
    content: { "application/json": { schema: ref("Error") } },
  },
};

const slugParam = (description: string, example: string) => ({
  name: "slug",
  in: "path",
  required: true,
  description,
  schema: { type: "string", example },
});

const totalMeta = obj({ total: { type: "integer", example: 7 } });

/** `siteUrl`: public origin (NEXT_PUBLIC_SITE_URL), listed after the relative server so "Try it out" hits the current host. */
export function buildOpenApiSpec(siteUrl?: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Hooked Entertainment — Public API",
      version: "1.0.0",
      description: [
        "API công khai (chỉ đọc + form đăng ký) cho website Hooked Entertainment.",
        "",
        "- Mọi response thành công có dạng `{ data, meta? }`; lỗi có dạng `{ error: { code, message, fields? } }`.",
        "- Chỉ trả nội dung **đã xuất bản**. Nội dung được cache và làm mới ngay khi admin lưu trong CMS.",
        "- Văn bản có định dạng dùng markdown rút gọn: `**đậm**` và `[nhãn](/duong-dan)`; trường `parts` là bản đã tách sẵn.",
        "- Tài liệu ánh xạ API ↔ màn hình: `plan/08-api.md`.",
      ].join("\n"),
    },
    servers: [
      { url: "/api/v1", description: "Máy chủ hiện tại" },
      ...(siteUrl
        ? [{ url: `${siteUrl.replace(/\/$/, "")}/api/v1`, description: "Website (NEXT_PUBLIC_SITE_URL)" }]
        : []),
    ],
    tags: [
      {
        name: "Site",
        description:
          "Cấu hình chung: thông tin công ty, mạng xã hội, menu header / menu mobile / footer — dùng ở MỌI trang.",
      },
      { name: "Pages", description: "Nội dung biên tập của từng trang (tiêu đề, đoạn giới thiệu, nhãn, SEO…)." },
      { name: "Courses", description: "Khóa học và danh mục khóa học Hooked Academy — trang /academy, form đăng ký." },
      { name: "Students", description: "Học viên tiêu biểu — /academy/students, carousel câu chuyện trên /academy." },
      { name: "Projects", description: "Dự án / sự kiện — /projects, /projects/{slug}, video play từ card." },
      { name: "Posts", description: "Bài viết blog — /blog, /blog/{slug}." },
      { name: "Partners", description: "Đối tác & dự án hợp tác — dải logo trang chủ, /partners." },
      { name: "Registrations", description: 'Form "Đăng ký tư vấn" → tạo lead trong CMS (mục Đăng ký tư vấn).' },
    ],
    paths: {
      "/site": {
        get: {
          tags: ["Site"],
          operationId: "getSite",
          summary: "Cấu hình website + menu",
          description:
            "Header desktop (`navigation.desktop`), menu mobile (`navigation.mobile`), footer (`navigation.footer`, `company`, `socials`), SEO mặc định.",
          responses: { 200: ok("Cấu hình website", ref("Site")), 500: errors[500] },
        },
      },
      "/pages/{page}": {
        get: {
          tags: ["Pages"],
          operationId: "getPage",
          summary: "Nội dung một trang",
          description:
            "`home` → HomePage (hero, intro, highlight, dịch vụ, blog carousel, đối tác). `academy`, `students`, `projects`, `blog`, `about`, `contact` (kèm thông tin liên hệ), `partners` (kèm logo + dự án hợp tác).",
          parameters: [
            {
              name: "page",
              in: "path",
              required: true,
              schema: {
                type: "string",
                enum: ["home", "academy", "students", "projects", "blog", "about", "contact", "partners"],
              },
            },
          ],
          responses: {
            200: {
              description: "Nội dung trang (schema theo từng trang)",
              content: {
                "application/json": {
                  schema: dataEnvelope({
                    oneOf: [
                      ref("HomePage"),
                      ref("AcademyPage"),
                      ref("StudentsPage"),
                      ref("ProjectsPage"),
                      ref("BlogPage"),
                      ref("AboutPage"),
                      ref("ContactPage"),
                      ref("PartnersPage"),
                    ],
                  }),
                },
              },
            },
            404: errors[404],
          },
        },
      },
      "/course-categories": {
        get: {
          tags: ["Courses"],
          operationId: "listCourseCategories",
          summary: "Danh mục khóa học",
          description: "Theo thứ tự kéo thả trong CMS (Quản lý Academy → Danh mục khóa học).",
          responses: { 200: ok("Danh mục khóa học", arrayOf(ref("CourseCategory")), totalMeta) },
        },
      },
      "/courses": {
        get: {
          tags: ["Courses"],
          operationId: "listCourses",
          summary: "Danh sách khóa học",
          description:
            "Theo thứ tự hiển thị trong carousel, mỗi khóa học kèm `category`. `meta.categories` = các danh mục có ít nhất một khóa học đã xuất bản (nút lọc trên /academy). Toàn bộ danh mục: `GET /course-categories`.",
          responses: {
            200: ok(
              "Khóa học đã xuất bản",
              arrayOf(ref("Course")),
              obj({ total: { type: "integer" }, categories: arrayOf(ref("CourseCategory")) }),
            ),
          },
        },
      },
      "/courses/{id}": {
        get: {
          tags: ["Courses"],
          operationId: "getCourse",
          summary: "Chi tiết khóa học",
          description: 'Chương trình học, quyền lợi, giảng viên, học phí — modal "Nội dung khóa học".',
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Id khóa học",
              schema: { type: "string", example: "dj-co-ban" },
            },
          ],
          responses: { 200: ok("Khóa học", ref("Course")), 404: errors[404] },
        },
      },
      "/students": {
        get: {
          tags: ["Students"],
          operationId: "listStudents",
          summary: "Danh sách học viên",
          parameters: [
            {
              name: "featured",
              in: "query",
              description: "true → học viên trong carousel trang Academy",
              schema: { type: "boolean" },
            },
            {
              name: "role",
              in: "query",
              description: "Vai trò, không phân biệt hoa thường (ví dụ `DJ`, `MC HYPE`)",
              schema: { type: "string" },
            },
          ],
          responses: { 200: ok("Học viên đã xuất bản", arrayOf(ref("Student")), totalMeta) },
        },
      },
      "/students/{slug}": {
        get: {
          tags: ["Students"],
          operationId: "getStudent",
          summary: "Câu chuyện một học viên",
          description: "Dữ liệu cho Student reader (`/academy/students?story={slug}`).",
          parameters: [slugParam("Slug học viên", "jgrayson")],
          responses: { 200: ok("Học viên", ref("Student")), 404: errors[404] },
        },
      },
      "/project-categories": {
        get: {
          tags: ["Projects"],
          operationId: "listProjectCategories",
          summary: "Danh mục dịch vụ (chip lọc)",
          responses: { 200: ok("Danh mục theo thứ tự", arrayOf(ref("ProjectCategory")), totalMeta) },
        },
      },
      "/projects": {
        get: {
          tags: ["Projects"],
          operationId: "listProjects",
          summary: "Danh sách dự án (card)",
          parameters: [
            { name: "category", in: "query", description: "Slug danh mục, ví dụ `media`", schema: { type: "string" } },
          ],
          responses: { 200: ok("Dự án đã xuất bản", arrayOf(ref("ProjectSummary")), totalMeta) },
        },
      },
      "/projects/{slug}": {
        get: {
          tags: ["Projects"],
          operationId: "getProject",
          summary: "Chi tiết dự án",
          description: "Thông tin, dịch vụ, đối tác, ảnh hero, album ảnh (lightbox) và video YouTube.",
          parameters: [slugParam("Slug dự án", "devoid-music-festival")],
          responses: { 200: ok("Dự án", ref("Project")), 404: errors[404] },
        },
      },
      "/posts": {
        get: {
          tags: ["Posts"],
          operationId: "listPosts",
          summary: "Danh sách bài viết",
          description: "Mới nhất trước; bài lên lịch (publishedAt trong tương lai) chưa xuất hiện.",
          parameters: [
            { name: "tag", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 12 } },
          ],
          responses: { 200: ok("Trang bài viết", arrayOf(ref("PostSummary")), ref("Pagination")) },
        },
      },
      "/posts/{slug}": {
        get: {
          tags: ["Posts"],
          operationId: "getPost",
          summary: "Chi tiết bài viết",
          parameters: [slugParam("Slug bài viết", "vui-fest-cat-ba")],
          responses: { 200: ok("Bài viết", ref("Post")), 404: errors[404] },
        },
      },
      "/partners": {
        get: {
          tags: ["Partners"],
          operationId: "listPartners",
          summary: "Logo đối tác",
          parameters: [
            {
              name: "placement",
              in: "query",
              description: "`home` = dải logo trang chủ, `partners` = lưới logo /partners",
              schema: { type: "string", enum: ["home", "partners"] },
            },
          ],
          responses: { 200: ok("Đối tác theo thứ tự", arrayOf(ref("Partner")), totalMeta) },
        },
      },
      "/collaborations": {
        get: {
          tags: ["Partners"],
          operationId: "listCollaborations",
          summary: "Dự án hợp tác nổi bật",
          responses: { 200: ok("Dự án hợp tác", arrayOf(ref("Collaboration")), totalMeta) },
        },
      },
      "/registrations": {
        post: {
          tags: ["Registrations"],
          operationId: "createRegistration",
          summary: "Gửi đăng ký tư vấn",
          description:
            "Form trên /academy (carousel, danh sách khóa học, modal chương trình học). Tạo lead trạng thái `new`.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: ref("RegistrationInput"),
                example: {
                  name: "Nguyễn Văn A",
                  phone: "0912345678",
                  email: "a@gmail.com",
                  courseId: "dj-co-ban",
                  source: "Academy · carousel",
                },
              },
            },
          },
          responses: {
            201: ok("Đã nhận đăng ký", ref("RegistrationResult")),
            422: {
              ...errors[422],
              content: {
                "application/json": {
                  schema: ref("Error"),
                  example: {
                    error: {
                      code: "validation_error",
                      message: "Dữ liệu không hợp lệ.",
                      fields: { phone: "Số điện thoại chưa đúng định dạng." },
                    },
                  },
                },
              },
            },
            429: errors[429],
          },
        },
      },
    },
    components: {
      schemas: {
        Error: obj({
          error: obj(
            {
              code: str("not_found | validation_error | rate_limited | server_error", "validation_error"),
              message: str(undefined, "Dữ liệu không hợp lệ."),
              fields: {
                type: "object",
                additionalProperties: { type: "string" },
                description: "Lỗi theo từng trường (422)",
              },
            },
            ["code", "message"],
          ),
        }),
        Pagination: obj({
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        }),
        Image: obj(
          {
            url: str("Đường dẫn ảnh (tương đối với website hoặc tuyệt đối)", "/images/photos/stage-lights.png"),
            alt: str(
              "Tiêu đề của nội dung chứa ảnh (tên khóa học, dự án, bài viết, đối tác…; ảnh trong album dự án: “<tên dự án> – ảnh N”). CMS không có ô alt riêng.",
              "DJ CƠ BẢN",
            ),
            width: { type: "integer" },
            height: { type: "integer" },
          },
          ["url", "alt"],
        ),
        Link: obj({ label: str(undefined, "Đối tác của Hooked"), href: str(undefined, "/partners") }),
        NavItem: obj({
          label: str(undefined, "Academy"),
          href: str(undefined, "/academy"),
          newTab: { type: "boolean" },
        }),
        InlineRun: {
          oneOf: [
            { type: "string" },
            obj({ text: { type: "string" }, bold: { type: "boolean" }, href: { type: "string" } }, ["text"]),
          ],
          description: "Một đoạn văn bản: chuỗi thường, hoặc { text, bold } / { text, href }",
        },
        Site: obj({
          name: str(undefined, "Hooked Entertainment"),
          tagline: str(undefined, "Support Local Artists"),
          description: str(),
          company: obj({
            legalName: str(undefined, "CÔNG TY TNHH HOOKED ENTERTAINMENT"),
            address: str(),
            email: str(undefined, "hooked.vie@gmail.com"),
            phone: obj({ display: str(undefined, "0966 609 807"), href: str(undefined, "tel:+84966609807") }),
          }),
          socials: arrayOf(ref("Link")),
          seo: obj({
            titleTemplate: str(undefined, "%s · Hooked Entertainment"),
            defaultTitle: str(),
            ogImage: nullable(ref("Image")),
          }),
          navigation: obj({
            desktop: arrayOf(ref("NavItem")),
            mobile: arrayOf(ref("NavItem")),
            footer: arrayOf(ref("NavItem")),
          }),
        }),
        Partner: obj({ id: str(), name: str(undefined, "Sun Group"), logo: ref("Image"), website: nullable(str()) }),
        Collaboration: obj({
          id: str(),
          title: str(undefined, "Vui Fest Cát Bà"),
          partnerLabel: str(),
          href: str(undefined, "/projects/vui-fest-cat-ba"),
          image: ref("Image"),
        }),
        HomePage: obj({
          hero: obj({
            slides: arrayOf(
              obj({
                id: str(),
                type: {
                  type: "string",
                  enum: ["image", "video"],
                  description: "video = YouTube tự phát, không tiếng, lặp lại",
                },
                image: { ...ref("Image"), description: "Ảnh slide, hoặc ảnh chờ (poster) của video" },
                youtubeId: nullable(str("ID video YouTube (chỉ với type = video)", "UJvCMG7W6q8")),
              }),
            ),
          }),
          intro: obj({ titleLines: arrayOf({ type: "string" }), body: str() }),
          highlights: arrayOf(
            obj({
              id: str(),
              title: str(),
              href: str(),
              align: { type: "string", enum: ["start", "end"] },
              image: ref("Image"),
            }),
          ),
          services: arrayOf(
            obj({
              id: str(),
              title: str(),
              titleLines: nullable(arrayOf({ type: "string" })),
              description: str(),
              href: str(),
              image: ref("Image"),
            }),
          ),
          blogCarousel: obj({
            initialIndex: { type: "integer" },
            items: arrayOf(
              obj({ id: str(), title: str(), lines: arrayOf({ type: "string" }), href: str(), image: ref("Image") }),
            ),
          }),
          partners: obj({
            titleLines: arrayOf({ type: "string" }),
            body: str(),
            cta: ref("Link"),
            logos: arrayOf(ref("Partner")),
          }),
        }),
        Seo: obj({ title: str(), description: str() }),
        AcademyPage: obj({ seo: ref("Seo") }),
        StudentsPage: obj({ seo: ref("Seo") }),
        ProjectsPage: obj({
          seo: ref("Seo"),
          cardLayout: {
            ...arrayOf(
              obj({
                format: { type: "string", enum: ["landscape", "portrait", "compact", "wide", "panorama"] },
                projectId: str("Id dự án (GET /projects); một dự án có thể nằm ở nhiều ô", "devoid-music-festival"),
              }),
            ),
            description:
              "Cài đặt hiển thị dự án: các ô của lưới “Tất cả” trên desktop, từ trên xuống. Ô có dự án chưa xuất bản bị bỏ qua; không còn ô nào thì mỗi dự án đã xuất bản một hàng full chiều ngang.",
          },
        }),
        BlogPage: obj({ seo: ref("Seo") }),
        AboutPage: obj({
          intro: obj(
            {
              title: str(),
              eyebrow: str(),
              lead: str(),
              headlineLines: arrayOf({ type: "string" }),
              body: str(),
              aside: str("Đoạn phụ (không bắt buộc)"),
            },
            ["title", "eyebrow", "lead", "headlineLines", "body"],
          ),
          ecosystem: obj({
            titleLines: arrayOf({ type: "string" }),
            statement: str(),
            body: str(),
            capabilities: arrayOf(obj({ id: str(), lead: str(), rest: str(), href: str() }, ["id", "lead", "rest"])),
          }),
          portfolio: ref("Link"),
          photos: obj({ top: arrayOf(ref("Image")), bottom: arrayOf(ref("Image")) }),
        }),
        ContactPage: obj({
          eyebrow: str(),
          title: str(),
          contact: obj({
            email: str(),
            phone: obj({ display: str(), href: str() }),
            address: str(),
            legalName: str(),
            socials: arrayOf(ref("Link")),
          }),
        }),
        PartnersPage: obj({
          title: str(),
          body: str("Giới thiệu, HTML đã lọc (p, strong, em, u, a, ul, ol, li, blockquote)"),
          logos: arrayOf(ref("Partner")),
          collaborations: arrayOf(ref("Collaboration")),
        }),
        CourseCategory: obj({ id: str(undefined, "dj"), label: str(undefined, "DJ") }),
        Course: obj({
          id: str(undefined, "dj-co-ban"),
          title: str("Tên khóa học như nhập trong CMS; giao diện tự in hoa nếu thiết kế cần", "DJ cơ bản"),
          category: nullable(ref("CourseCategory")),
          description: str(),
          instructors: arrayOf(obj({ label: str(undefined, "Giảng viên chính"), value: str(undefined, "Marcuz") })),
          duration: str(undefined, "Từ 2 đến 3 tháng"),
          schedule: arrayOf(obj({ label: nullable(str()), value: str() })),
          tuition: str(undefined, "15.000.000 VND"),
          modules: arrayOf({ type: "string" }),
          benefits: arrayOf({ type: "string" }),
          image: ref("Image"),
          zoomTopLeft: { type: "boolean" },
        }),
        Student: obj({
          id: str(),
          slug: str(undefined, "jgrayson"),
          name: str(undefined, "JGRAYSON"),
          role: str("Vai trò, nhập tự do trong CMS", "DJ"),
          affiliation: str(undefined, "Hooked Academy"),
          portrait: {
            allOf: [ref("Image"), obj({ crop: nullable(obj({ scale: { type: "number" }, top: { type: "number" } })) })],
          },
          story: str(
            "HTML đã lọc: p, br, strong, em, u, a, ul, ol, li, blockquote (liên kết ngoài có target=_blank)",
            "<p>Sau khóa học DJ Chuyên Nghiệp…</p>",
          ),
          featured: { type: "boolean" },
          headline: nullable(str()),
        }),
        ProjectCategory: obj({ id: str(), slug: str(undefined, "media"), label: str(undefined, "Media") }),
        ProjectVideo: obj({
          id: str(),
          youtubeId: str(undefined, "UJvCMG7W6q8"),
          title: str(),
          thumbnail: ref("Image"),
        }),
        ProjectSummary: obj({
          id: str(),
          slug: str(undefined, "devoid-music-festival"),
          name: str("Tên dự án; website in hoa bằng CSS", "Devoid Music Festival"),
          categories: {
            ...arrayOf(ref("ProjectCategory")),
            description: "Theo thứ tự chọn trong CMS: bộ lọc, dòng nhãn dưới tên và mục “Dịch vụ cung cấp”",
          },
          cover: ref("Image"),
          featuredVideo: nullable(ref("ProjectVideo")),
        }),
        Project: {
          allOf: [
            ref("ProjectSummary"),
            obj({
              partners: arrayOf({ type: "string" }),
              description: str(
                "HTML đã lọc: p, br, strong, em, u, a, ul, ol, li, blockquote (liên kết ngoài có target=_blank)",
                "<p>Devoid Music Festival là…</p>",
              ),
              hero: obj({ image: { ...ref("Image"), description: "Hiển thị nguyên ảnh, không cắt" } }),
              photos: arrayOf({ allOf: [ref("Image"), obj({ id: str() })] }),
              videos: arrayOf(ref("ProjectVideo")),
              albumLink: obj({ label: str(), href: nullable(str()) }),
            }),
          ],
        },
        PostSummary: obj({
          id: str(),
          slug: str(undefined, "vui-fest-cat-ba"),
          title: str(),
          kicker: str(undefined, "Hooked × Sun Group"),
          excerpt: str("Rút từ đoạn mở đầu (văn bản thuần, ~160 ký tự)"),
          cover: ref("Image"),
          tags: arrayOf({ type: "string" }),
          author: str(),
          publishedAt: nullable(str("ISO date-time")),
          readingMinutes: { type: "integer", example: 4 },
        }),
        PostBlock: {
          oneOf: [
            obj({ id: str(), type: { const: "heading" }, text: str() }),
            obj({
              id: str(),
              type: { const: "paragraph" },
              html: str(
                "HTML đã lọc: một hoặc nhiều <p>; strong, em, u, a, ul, ol, li, blockquote (liên kết ngoài có target=_blank)",
                "<p>Đoạn một…</p><p>Đoạn hai…</p>",
              ),
            }),
            obj({
              id: str(),
              type: { const: "list" },
              items: arrayOf(obj({ text: str(), parts: arrayOf(ref("InlineRun")) })),
            }),
            obj({ id: str(), type: { const: "image" }, image: ref("Image"), caption: nullable(str()) }),
            obj({ id: str(), type: { const: "imagePair" }, images: arrayOf(ref("Image")) }),
            obj({ id: str(), type: { const: "quote" }, text: str(), cite: nullable(str()) }),
            obj({ id: str(), type: { const: "cta" }, label: str(), href: str() }),
          ],
          discriminator: { propertyName: "type" },
        },
        Post: {
          allOf: [
            ref("PostSummary"),
            obj({
              intro: obj({ text: str(), parts: arrayOf(ref("InlineRun")) }),
              introCta: nullable(ref("Link")),
              blocks: arrayOf(ref("PostBlock")),
              seo: obj({ title: str(), description: str(), image: nullable(ref("Image")) }),
            }),
          ],
        },
        RegistrationInput: obj(
          {
            name: str("Họ và tên (bắt buộc, ≤ 120 ký tự)"),
            phone: str("Số điện thoại Việt Nam (bắt buộc)", "0912345678"),
            email: str("Email (không bắt buộc)"),
            courseId: str("Id khóa học (bắt buộc)", "dj-co-ban"),
            source: str("Nơi mở form", "Academy · carousel"),
            website: str("Honeypot chống spam — luôn để trống"),
          },
          ["name", "phone", "courseId"],
        ),
        RegistrationResult: obj({
          id: str(undefined, "lead_fc09a693a3"),
          status: { const: "new" },
          course: obj({ id: str(), title: str(undefined, "DJ cơ bản") }),
          createdAt: str("ISO date-time"),
        }),
      },
    },
  } as const;
}
