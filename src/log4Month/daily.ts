import moment, { type Moment } from "moment";

export const daily = () => {
    const today = moment();
	const year  = today.year();
	const month = process.env.MONTH || today.format("MMMM");

    const result: Moment[] = [];

    for (let i = 1; i <= 31; i++) {
        const dt = moment(`${month} ${i}, ${year} 13:00:00`, ["MMMM D, YYYY HH:mm:ss"]); // shift starts at 1pm
        if (dt.format("MMMM") !== month) {
            break; //for
        }
        if (["Saturday", "Sunday"].includes(dt.format("dddd"))) {
            continue; // for
        }
        
        result.push(dt);
    }

    return result;
};
