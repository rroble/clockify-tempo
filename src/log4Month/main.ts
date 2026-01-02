import "dotenv/config"; // load env first!
import { daily } from "./daily.js";
import { isHoliday } from "./holidays.js";
import { isVacation } from "./vacation.js";
import { Worklog } from "../lib/Worklog.js";
import * as Tempo from "../lib/Tempo.js";
import * as Clockify from "../lib/Clockify.js";

(async() => {
    for (const day of daily()) {
        console.log("------", day.toISOString(), "------");
        const worklog = new Worklog({
            issueKey: "TIQ-2149",
            date: day.utc().toISOString(),
            timeSpentSeconds: 8.5 * 3600,
            authorAccountId: process.env.JIRA_USER as string,
        });

        const { holiday, name } = isHoliday(day);
        if (holiday) {
            worklog.setIssueKey("Holiday")
                .setDescription(name || "Holiday");

        }

        const { vacation, type } = isVacation(day);
        if (vacation) {
            worklog.setIssueKey("Vacation")
                .setDescription(type || "Leave");
        }

        const [tempoResult, clockifyResult] = await Promise.all([
            holiday || vacation || Tempo.log(worklog.data()),
            Clockify.newEntry(worklog.data()),
        ]);
        console.log("Tempo:", tempoResult);
        console.log("Clockify:", clockifyResult);
    }
})().then(() => {
    console.log("Done");
});
