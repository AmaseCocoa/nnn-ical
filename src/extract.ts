export interface ScheduleItem {
    startAt: Date;
    endAt: Date;
    subject: string;
    location: string;
}

export interface DailySchedule {
    date: Date;
    dateCaption: string;
    month: number;
    day: number;
    items: ScheduleItem[];
}

export interface CardData {
    year: number;
    venue: string;
    period: {
        start: Date;
        end: Date;
    };
    schedules: DailySchedule[];
}

export function extractScheduleCards(target?: Document | Element): CardData[] {
    const rootElement = target ?? (typeof document !== 'undefined' ? document : null);

    if (!rootElement) {
        throw new Error('有効な Document または Element オブジェクトが提供されていません。');
    }

    const descriptionDiv = rootElement.querySelector<HTMLElement>('[data-entry-descriptions]');
    if (descriptionDiv) {
        const text = descriptionDiv.textContent?.trim() || '';
        if (text.includes('未掲載') || text.includes('準備中')) {
            throw new Error(`スケジュールはまだ未掲載です`);
        }
    }

    const cards = rootElement.querySelectorAll<HTMLElement>('.card-body');
    const result: CardData[] = [];

    cards.forEach((card: HTMLElement) => {
        const label = card.querySelector<HTMLElement>('.bold-dark');

        if (label && label.textContent?.includes('実施期間')) {
            const periodSpan = card.querySelector<HTMLElement>('span');
            const periodText = periodSpan?.textContent?.trim() || '';
            const dateMatches = periodText.match(/\d{4}\/\d{1,2}\/\d{1,2}/g);

            if (!dateMatches || dateMatches.length < 2) {
                throw new Error(`実施期間の日付パースに失敗しました: ${periodText}`);
            }

            const startDate = new Date(dateMatches[0]);
            const endDate = new Date(dateMatches[1]);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error(`無効な実施期間 Date オブジェクトです: ${periodText}`);
            }

            const year: number = startDate.getFullYear();

            const boldElements = Array.from(card.querySelectorAll<HTMLElement>('.bold-dark'));
            const venueLabel = boldElements.find(el => el.textContent?.includes('会場／住所'));
            const venueText = venueLabel?.nextElementSibling?.textContent?.trim() || '';

            const tables = card.querySelectorAll<HTMLTableElement>('.time-table');

            const dailySchedules: DailySchedule[] = Array.from(tables).map((table: HTMLTableElement) => {
                const dateCaption = table.querySelector('caption')?.textContent?.trim() || '';

                const dateMatch = dateCaption.match(/(\d{1,2})\/(\d{1,2})/);
                if (!dateMatch) {
                    throw new Error(`caption からの日付取得に失敗しました: ${dateCaption}`);
                }

                const month = parseInt(dateMatch[1], 10);
                const day = parseInt(dateMatch[2], 10);
                const scheduleDate = new Date(year, month - 1, day);

                if (isNaN(scheduleDate.getTime())) {
                    throw new Error(`DailySchedule の Date 作成に失敗しました: ${year}/${month}/${day}`);
                }

                const scheduleRows = table.querySelectorAll<HTMLTableRowElement>('tbody tr');
                const rows: ScheduleItem[] = Array.from(scheduleRows).map((row: HTMLTableRowElement) => {
                    const cols = row.querySelectorAll<HTMLTableCellElement>('td');
                    const timeRangeText = cols[0]?.textContent?.trim() || '';
                    const [startTimeStr, endTimeStr] = timeRangeText.split('〜');

                    const buildDateTime = (timeStr: string | undefined): Date => {
                        if (!timeStr) {
                            throw new Error(`時刻文字列が存在しません: ${timeRangeText}`);
                        }
                        const [hours, minutes] = timeStr.split(':').map(Number);
                        const parsedDate = new Date(year, month - 1, day, hours, minutes);

                        if (isNaN(parsedDate.getTime())) {
                            throw new Error(`ScheduleItem の Date 作成に失敗しました: ${timeStr}`);
                        }
                        return parsedDate;
                    };

                    return {
                        startAt: buildDateTime(startTimeStr),
                        endAt: buildDateTime(endTimeStr),
                        subject: cols[1]?.textContent?.trim() || '',
                        location: cols[2]?.textContent?.trim() || ''
                    };
                });

                rows.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

                return {
                    date: scheduleDate,
                    dateCaption: dateCaption,
                    month: month,
                    day: day,
                    items: rows
                };
            });

            dailySchedules.sort((a, b) => a.date.getTime() - b.date.getTime());

            const cardData: CardData = {
                year: year,
                venue: venueText,
                period: {
                    start: startDate,
                    end: endDate
                },
                schedules: dailySchedules
            };

            result.push(cardData);
        }
    });

    return result;
}
