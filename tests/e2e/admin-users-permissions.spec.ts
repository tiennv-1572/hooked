import { expect, request, test, type APIRequestContext } from "@playwright/test";

/**
 * The users API enforces the rules of the users screen (src/server/auth/user-permissions.ts), so they cannot be gone
 * around by calling the API directly. Seeded accounts (scripts/db-seed.ts): owner, admin, editor.
 */
const PASSWORD = "hooked2026";
const OWNER = "admin@hooked.vn";
const ADMIN = "academy@hooked.vn";
const EDITOR = "content@hooked.vn";

type User = { id: string; email: string; name: string; role: string; status: string };

async function signedIn(baseURL: string, email: string): Promise<APIRequestContext> {
  const api = await request.newContext({ baseURL });
  const response = await api.post("/api/admin/auth/login", { data: { email, password: PASSWORD } });
  expect(response.status(), `login ${email}`).toBe(200);
  return api;
}

async function users(api: APIRequestContext): Promise<User[]> {
  return (await (await api.get("/api/admin/collections/users")).json()).data;
}

const byEmail = (list: User[], email: string) => list.find((user) => user.email === email)!;

test.describe("users API permissions", () => {
  // One shared database and session per role: in order, and on one project only (it is API-only).
  test.describe.configure({ mode: "serial" });

  let owner: APIRequestContext;
  let admin: APIRequestContext;
  let editor: APIRequestContext;
  let ids: Record<"owner" | "admin" | "editor", string>;

  test.beforeAll(async ({ baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "API only: once");
    owner = await signedIn(baseURL!, OWNER);
    admin = await signedIn(baseURL!, ADMIN);
    editor = await signedIn(baseURL!, EDITOR);
    const list = await users(owner);
    ids = { owner: byEmail(list, OWNER).id, admin: byEmail(list, ADMIN).id, editor: byEmail(list, EDITOR).id };
  });

  test.afterAll(async () => {
    await Promise.all([owner?.dispose(), admin?.dispose(), editor?.dispose()]);
  });

  test("an editor cannot raise or change their own role or status", async () => {
    const url = `/api/admin/collections/users/${ids.editor}`;
    expect((await editor.patch(url, { data: { role: "owner" } })).status()).toBe(403);
    expect((await editor.patch(url, { data: { role: "admin" } })).status()).toBe(403);
    expect((await editor.patch(url, { data: { status: "disabled" } })).status()).toBe(403);
    expect((await editor.patch(url, { data: { lastActiveAt: "2030-01-01T00:00:00.000Z" } })).status()).toBe(422);
    expect(byEmail(await users(owner), EDITOR).role).toBe("editor");
  });

  test("everyone can still edit their own name and e-mail (Tài khoản của tôi)", async () => {
    const me = byEmail(await users(owner), EDITOR);
    const url = `/api/admin/collections/users/${ids.editor}`;
    const renamed = await editor.patch(url, { data: { name: "Lê Thu Hà (thử)", email: EDITOR } });
    expect(renamed.status()).toBe(200);
    expect((await renamed.json()).data.name).toBe("Lê Thu Hà (thử)");
    // The edit sheet sends the unchanged role and status too.
    expect(
      (await editor.patch(url, { data: { name: me.name, email: EDITOR, role: "editor", status: me.status } })).status(),
    ).toBe(200);
  });

  test("an editor manages nobody", async () => {
    expect((await editor.patch(`/api/admin/collections/users/${ids.admin}`, { data: { name: "X" } })).status()).toBe(
      403,
    );
    expect(
      (
        await editor.post("/api/admin/collections/users", {
          data: { name: "X", email: "x@example.com", role: "editor", status: "invited" },
        })
      ).status(),
    ).toBe(403);
    expect((await editor.delete(`/api/admin/collections/users/${ids.admin}`)).status()).toBe(403);
    expect(
      (await editor.post("/api/admin/collections/users/bulk-delete", { data: { ids: [ids.admin] } })).status(),
    ).toBe(403);
    expect(
      (await editor.post("/api/admin/collections/users/reorder", { data: { ids: [ids.admin, ids.owner] } })).status(),
    ).toBe(403);
  });

  test("an admin cannot touch an owner nor create one", async () => {
    const url = `/api/admin/collections/users/${ids.owner}`;
    expect((await admin.patch(url, { data: { role: "editor" } })).status()).toBe(403);
    expect((await admin.patch(url, { data: { status: "disabled" } })).status()).toBe(403);
    expect((await admin.patch(url, { data: { name: "X" } })).status()).toBe(403);
    expect((await admin.delete(url)).status()).toBe(403);
    expect(
      (await admin.post("/api/admin/collections/users/bulk-delete", { data: { ids: [ids.owner] } })).status(),
    ).toBe(403);
    const asOwner = { name: "Nguyễn Minh Quân", email: "quan.nguyen@example.com", role: "owner", status: "invited" };
    expect((await admin.post("/api/admin/collections/users", { data: asOwner })).status()).toBe(403);
    expect((await admin.patch(`/api/admin/collections/users/${ids.admin}`, { data: { role: "owner" } })).status()).toBe(
      403,
    );
    const list = await users(owner);
    expect(byEmail(list, OWNER)).toMatchObject({ role: "owner", status: "active" });
    expect(list.some((user) => user.email === asOwner.email)).toBe(false);
  });

  test("an admin still invites, re-roles and removes admins and editors", async () => {
    const invited = await admin.post("/api/admin/collections/users", {
      data: {
        name: "Nguyễn Minh Quân",
        email: "quan.nguyen@example.com",
        role: "editor",
        status: "invited",
        password: "TamThoi2026",
      },
    });
    expect(invited.status()).toBe(201);
    const id = (await invited.json()).data.id as string;
    const url = `/api/admin/collections/users/${id}`;
    expect((await admin.patch(url, { data: { role: "admin" } })).status()).toBe(200);
    expect((await admin.patch(url, { data: { status: "disabled" } })).status()).toBe(200);
    expect((await admin.delete(url)).status()).toBe(204);
  });

  test("nobody changes their own role or status, nor deletes themselves", async () => {
    const url = `/api/admin/collections/users/${ids.owner}`;
    expect((await owner.patch(url, { data: { role: "editor" } })).status()).toBe(403);
    expect((await owner.patch(url, { data: { status: "disabled" } })).status()).toBe(403);
    expect((await owner.delete(url)).status()).toBe(403);
    expect((await admin.delete(`/api/admin/collections/users/${ids.admin}`)).status()).toBe(403);
  });

  test("an owner manages other owners", async () => {
    const created = await owner.post("/api/admin/collections/users", {
      data: {
        name: "Phạm Gia Hưng",
        email: "hung.pham@example.com",
        role: "owner",
        status: "invited",
        password: "TamThoi2026",
      },
    });
    expect(created.status()).toBe(201);
    const url = `/api/admin/collections/users/${(await created.json()).data.id}`;
    expect((await owner.patch(url, { data: { role: "admin" } })).status()).toBe(200);
    expect((await owner.delete(url)).status()).toBe(204);
  });
});
