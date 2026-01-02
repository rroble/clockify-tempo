import type { Moment } from "moment";

const vacation: Record<string, string> = {
	"2026-01-02": "New year vacation",
};

export const isVacation = (day: Moment) => {
    const date = day.format("YYYY-MM-DD");
    const name = vacation[date];
    return {
        vacation: name !== undefined,
        type: name,
    };
};
