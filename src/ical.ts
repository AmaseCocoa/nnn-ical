import type { CardData } from "./extract.js";

import { campus } from "./campus.js";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Date -> local `YYYYMMDDTHHMMSS` */
function formatDateLocal(date: Date): string {
  return (
    `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`
  );
}

/** Date -> UTC `YYYYMMDDTHHMMSSZ` */
function formatDateUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}` +
    `T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
  );
}

/** RFC 5545 3.3.11 TEXT のエスケープ */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * RFC 5545 3.1 に基づく折り返し（75オクテット超で行分割し、継続行の先頭に半角スペース）。
 * マルチバイト文字を分割しないよう UTF-8 バイト長で数える。
 */
function foldLine(line: string): string {
  if (typeof TextEncoder === "undefined") {
    // フォールバック: 75文字で分割
    const out: string[] = [];
    let cur = "";
    for (const ch of line) {
      if (cur.length >= 75) {
        out.push(cur);
        cur = " ";
      }
      cur += ch;
    }
    if (cur) out.push(cur);
    return out.join("\r\n");
  }

  const encoder = new TextEncoder();
  const limit = 75;
  let out = "";
  let bytes = 0;

  for (const ch of line) {
    const chBytes = encoder.encode(ch).length;
    if (bytes + chBytes > limit) {
      out += "\r\n ";
      bytes = 1; // 継続行先頭の半角スペース分
    }
    out += ch;
    bytes += chBytes;
  }
  return out;
}

function generateUid(): string {
  const cryptoObj =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto
      : null;
  if (cryptoObj) {
    return `${crypto.randomUUID()}@nnn-ical`;
  }
  const rand = Math.floor(Math.random() * 0xffffffff).toString(16);
  return `${Date.now()}-${rand}@nnn-ical`;
}

function venueKey(venue: string): string {
  const target = "キャンパス";
  const text = venue.endsWith(target)
    ? venue.slice(0, -target.length)
    : venue;
  return text.trimEnd();
}

export function toIcs(data: CardData[]): string {
  const dtstamp = formatDateUtc(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//nnn-ical//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:Asia/Tokyo",
  ];

  for (const d of data) {
    const key = venueKey(d.venue);
    const geo = campus["nnn"]?.[key];

    for (const schedule of d.schedules) {
      for (const subject of schedule.items) {
        lines.push("BEGIN:VEVENT");
        lines.push(`UID:${generateUid()}`);
        lines.push(`DTSTAMP:${dtstamp}`);
        lines.push(`DTSTART;TZID=Asia/Tokyo:${formatDateLocal(subject.startAt)}`);
        lines.push(`DTEND;TZID=Asia/Tokyo:${formatDateLocal(subject.endAt)}`);
        lines.push(
          `SUMMARY:${escapeText(`${subject.location}教室: ${subject.subject}`)}`,
        );
        lines.push(`LOCATION:${escapeText(d.venue)}`);
        if (geo) {
          lines.push(`GEO:${geo.lat};${geo.lon}`);
        }
        lines.push("STATUS:CONFIRMED");
        lines.push("END:VEVENT");
      }
    }
  }

  lines.push("END:VCALENDAR");

  return lines.map((line) => foldLine(line)).join("\r\n") + "\r\n";
}
