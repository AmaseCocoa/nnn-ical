import { extractScheduleCards } from "./extract.js";
import { toIcs } from "./ical.js";

(function () {
  "use strict";
})();

// src/index.ts
(function () {
  "use strict";
  try {
    const cards = extractScheduleCards();
    const icsContent = toIcs(cards);

    if (icsContent) {
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const blob = new Blob([bom, icsContent], {
        type: "text/calendar;charset=utf-8;",
      });

      const downloadUrl: string = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "sc-subjects.ics";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }
  } catch (error) {
    alert("エラーが発生しました");
    console.error(error);
  }
})();
