import type { CardData } from "./extract.js";

import * as ics from "ics";
import { type EventAttributes } from "ics";

import { campus } from "./campus.js";
import { calculateDuration } from "./duration.js";

export function toIcs(data: CardData[]) {
  const icsEvents: EventAttributes[] = [];
  const d = data[0];
  let text = "";
  const target = "キャンパス";

  if (d.venue.endsWith(target)) {
    text = d.venue.slice(0, -target.length);
  }
  const venue = text.trimEnd();
  d.schedules.map((schedule) => {
    const sharedLoc = {
      status: "CONFIRMED" as const,
      location: d.venue,
      geo: {
        lat: campus["nnn"][venue].lat,
        lon: campus["nnn"][venue].lon,
      },
    };
    schedule.items.map((subject) => {
      icsEvents.push({
        start: [
          subject.startAt.getUTCFullYear(),
          subject.startAt.getUTCDate(),
          subject.startAt.getUTCDate(),
          subject.startAt.getUTCHours(),
          subject.startAt.getUTCMinutes(),
        ],
        duration: calculateDuration(subject.startAt, subject.endAt),

        title: `${subject.location}教室: ${subject.subject}`,

        ...sharedLoc,
      });
    });
  });
  const { error, value } = ics.createEvents(icsEvents);

  if (error) {
    throw new Error(error.message);
  }

  return value;
}
