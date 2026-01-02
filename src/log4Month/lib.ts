import moment, { type Moment } from "moment";
import holidays from "../../holidays.json" with { type: "json" };
import vacation from "../../vacation.json" with { type: "json" };

export const daily = () => {
    const today = moment();
	const year  = process.env.YEAR || today.year();
	const month = process.env.MONTH || today.format("MMMM");
    const shiftStart = process.env.SHIFT_START || "08:00:00";

    const result: Moment[] = [];

    for (let i = 1; i <= 31; i++) {
        const dt = moment(`${month} ${i}, ${year} ${shiftStart}`, [
            "MMMM D, YYYY HH:mm:ss",
            "MMM D, YYYY HH:mm:ss",
        ]);

        // 31 days loop can go beyond next month
        if (![dt.format("MMMM"), dt.format("MMM")].includes(month)) {
            break; // for
        }

        // exclude weekends
        if (["Saturday", "Sunday"].includes(dt.format("dddd"))) {
            continue; // for
        }
        
        result.push(dt);
    }

    return result;
};

export const isHoliday = (day: Moment) => {
    const date = day.format("YYYY-MM-DD");
    const name = (holidays as Record<string, string>)[date];
    return {
        holiday: name !== undefined,
        name,
    };
};


export const isVacation = (day: Moment) => {
    const date = day.format("YYYY-MM-DD");
    const name = (vacation as Record<string, string>)[date];
    return {
        vacation: name !== undefined,
        type: name,
    };
};
