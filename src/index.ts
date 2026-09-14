import { extractScheduleCards } from "./extract.js";
import { toIcs } from "./ical.js";

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
    if (error instanceof Error) {
      if (error.message === "スケジュールはまだ未掲載です") {
        alert("スケジュールが未掲載のため、生成できません。")
      } else {
        alert("エラーが発生しました。詳細はコンソールを確認してください。");
        console.error("不明なエラーが発生しました: ", error);
      }
    } else {
      alert("エラーが発生しました。詳細はコンソールを確認してください。");
      console.error("不明なエラーが発生しました: ", error);
    }
  }
})();
