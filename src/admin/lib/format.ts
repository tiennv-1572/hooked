import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

function toDate(value: string | Date | undefined | null) {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

/** "02/11/2026" */
export function formatDate(value: string | Date | undefined | null) {
  const date = toDate(value);
  return date ? format(date, "dd/MM/yyyy", { locale: vi }) : "—";
}

/** "02/11/2026 09:30" */
export function formatDateTime(value: string | Date | undefined | null) {
  const date = toDate(value);
  return date ? format(date, "dd/MM/yyyy HH:mm", { locale: vi }) : "—";
}

/** "3 giờ trước" */
export function formatRelative(value: string | Date | undefined | null) {
  const date = toDate(value);
  return date ? `${formatDistanceToNowStrict(date, { locale: vi })} trước` : "—";
}

/** "1,2 MB" */
export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: exponent ? 1 : 0 })} ${units[exponent]}`;
}

export function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

/** Download rows as a UTF-8 CSV (Excel-friendly BOM). */
export function downloadCsv(filename: string, rows: (string | number | undefined | null)[][]) {
  const escape = (cell: string | number | undefined | null) => {
    const text = cell === undefined || cell === null ? "" : String(cell);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = "﻿" + rows.map((row) => row.map(escape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
