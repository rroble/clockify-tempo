import moment, { type Moment } from "moment";

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
