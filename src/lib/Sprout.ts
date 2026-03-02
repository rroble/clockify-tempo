import type { Moment } from "moment";

export const setHoliday = async(date: Moment, name?: string) => {
    const response = await fetch(`${process.env.MY_SPROUT_URL}/holiday`, {
        method: "POST",
        headers: {
            "Authorization": process.env.MY_SPROUT_API_KEY as string,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            date: date.format("YYYY-MM-DD"),
            name: name || "",
        }),
    });
    console.log({ holiday: response.statusText });
};

export const setVacation = async(date: Moment, vacationType?: string) => {
    const response = await fetch(`${process.env.MY_SPROUT_URL}/vacation`, {
        method: "POST",
        headers: {
            "Authorization": process.env.MY_SPROUT_API_KEY as string,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            date: date.format("YYYY-MM-DD"),
            type: vacationType || "",
        }),
    });
    console.log({ vacation: response.statusText });
};
