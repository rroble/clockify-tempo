import type { Moment } from "moment";

const holidays: Record<string, string> = {
	"2026-01-01": "New Year",
};

export const isHoliday = (day: Moment) => {
    const date = day.format("YYYY-MM-DD");
    const name = holidays[date];
    return {
        holiday: name !== undefined,
        name,
    };
};
