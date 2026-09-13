export function calculateDuration(start: Date, end: Date) {
  let diffMs = end.getTime() - start.getTime();

  if (diffMs < 0) {
    throw new Error("終了日時は開始日時より後の時間を指定してください。");
  }

  const msInDay = 1000 * 60 * 60 * 24;
  const msInHour = 1000 * 60 * 60;
  const msInMinute = 1000 * 60;
  const msInSecond = 1000;

  const days = Math.floor(diffMs / msInDay);
  diffMs %= msInDay;

  const hours = Math.floor(diffMs / msInHour);
  diffMs %= msInHour;

  const minutes = Math.floor(diffMs / msInMinute);
  diffMs %= msInMinute;

  const seconds = Math.floor(diffMs / msInSecond);

  return { days, hours, minutes, seconds };
}
