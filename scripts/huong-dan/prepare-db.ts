/**
 * Hướng dẫn CMS — prepares the screenshot stack's database after `pnpm db:seed` (scripts/huong-dan/stack.sh db).
 *
 *   DATABASE_URL=mysql://…@127.0.0.1:33307/hooked_huong_dan pnpm exec tsx scripts/huong-dan/prepare-db.ts
 *
 * 1. Dates. The seed is anchored to a fixed day (SEED_NOW), so as weeks pass the CMS shows its registrations as
 *    ever older ("45 ngày trước") and the dashboard's last-30-days figures empty out. Every timestamp — datetime
 *    columns and ISO date-times inside `doc` — moves by the same number of days, so the newest registration is
 *    today: pictures taken on any day look the same. Day-only dates (an event's date) are content and stay.
 *    Running it again moves nothing (the newest registration is already today).
 * 2. Registrations (leads) are generated people, but with plausible gmail addresses and phone numbers that could be
 *    someone's: they become `<name>@example.com` and `0900 000 0NN`, as kit.ts's email guard expects.
 *
 * Refuses any database but the stack's own.
 */
import mysql from "mysql2/promise";

const url = new URL(process.env.DATABASE_URL ?? "");
if (!["127.0.0.1", "localhost"].includes(url.hostname) || url.pathname !== "/hooked_huong_dan") {
  throw new Error(
    `Chỉ chạy trên DB của stack chụp ảnh (hooked_huong_dan ở máy), không phải ${url.host}${url.pathname}.`,
  );
}

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/;
const DAY = 86_400_000;

/** Calendar day in Vietnam, as a day number (timestamps of the seed are in that time zone's working hours). */
function vietnamDay(date: Date) {
  return Math.floor((date.getTime() + 7 * 3_600_000) / DAY);
}

function shiftDoc(value: unknown, days: number): unknown {
  if (typeof value === "string" && ISO_DATETIME.test(value)) {
    return new Date(new Date(value).getTime() + days * DAY).toISOString();
  }
  if (Array.isArray(value)) return value.map((item) => shiftDoc(item, days));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shiftDoc(item, days)]));
  }
  return value;
}

/** Top-level await is not available: the repo is CommonJS for tsx. */
async function main() {
  const db = await mysql.createConnection({ uri: url.toString(), timezone: "Z" });
  try {
    // 1. Dates
    const [[newest]] = await db.query<mysql.RowDataPacket[]>("select max(created_at) as at from leads");
    const days = newest?.at ? vietnamDay(new Date()) - vietnamDay(new Date(newest.at)) : 0;
    if (days !== 0) {
      const [columns] = await db.query<mysql.RowDataPacket[]>(
        "select table_name as t, column_name as c, data_type as type from information_schema.columns " +
          "where table_schema = database() and (data_type in ('datetime', 'timestamp') or column_name = 'doc')",
      );
      for (const { t, c, type } of columns) {
        if (type === "json") continue;
        await db.query(`update \`${t}\` set \`${c}\` = \`${c}\` + interval ? day where \`${c}\` is not null`, [days]);
      }
      for (const { t } of columns.filter((column) => column.c === "doc")) {
        const key = t === "singletons" ? "`key`" : "id";
        const [rows] = await db.query<mysql.RowDataPacket[]>(`select ${key} as k, doc from \`${t}\``);
        for (const row of rows) {
          const doc = typeof row.doc === "string" ? JSON.parse(row.doc) : row.doc;
          const shifted = shiftDoc(doc, days);
          if (JSON.stringify(shifted) !== JSON.stringify(doc)) {
            await db.query(`update \`${t}\` set doc = ? where ${key} = ?`, [JSON.stringify(shifted), row.k]);
          }
        }
      }
    }
    console.log(`Ngày tháng: dời ${days} ngày (đăng ký tư vấn mới nhất là hôm nay).`);

    // 2. Registrations: sample contacts
    const [leads] = await db.query<mysql.RowDataPacket[]>("select id, email, doc from leads");
    for (const lead of leads) {
      const doc = typeof lead.doc === "string" ? JSON.parse(lead.doc) : lead.doc;
      const number = String(lead.id).replace(/\D/g, "").slice(-3).padStart(3, "0");
      const phone = `0900000${number}`;
      const email = lead.email ? `${String(lead.email).split("@")[0]}@example.com` : null;
      await db.query("update leads set phone = ?, email = ?, doc = ? where id = ?", [
        phone,
        email,
        JSON.stringify({ ...doc, phone, ...(email ? { email } : {}) }),
        lead.id,
      ]);
    }
    const [[left]] = await db.query<mysql.RowDataPacket[]>(
      "select count(*) as n from leads where coalesce(email, '') <> '' and email not like '%@example.com'",
    );
    console.log(`Đăng ký tư vấn: ${leads.length} người mẫu, còn ${left.n} email không phải @example.com.`);
    if (Number(left.n) !== 0) process.exitCode = 1;
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
