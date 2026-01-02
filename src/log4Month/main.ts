import "dotenv/config"; // load env first!
import { daily } from "./daily.js";
import { isHoliday } from "./holidays.js";
import { isVacation } from "./vacation.js";
import { Worklog } from "../lib/Worklog.js";
import * as Tempo from "../lib/Tempo.js";
import * as Clockify from "../lib/Clockify.js";
import os from "os";
import fs from "fs";

const days = daily();
if (!days || days.length === 0) {
    console.error("[Clockify Tempo] Cannot identify days, please check env like YEAR, MONTH, SHIFT_START");
    process.exit(1);
}

const runId = (() => {
    return os.tmpdir() + `/clockify_tempo_${days[0]?.format("YYYY-MM")}_${days.length}`;
})();

if (fs.existsSync(runId)) {
    console.warn(`[Clockify Tempo] ${days[0]?.format("MMMM")} logs exist, aborting to avoid duplicates.`);
    process.exit();
}

(async() => {
    console.log(`[Clockify Tempo] Logging for whole month of ${days[0]?.format("MMMM")}`);
    for (const day of days) {
        console.log("------", day.toISOString(), "------");
        const worklog = new Worklog({
            issueKey: process.env.JIRA_TICKET || "TIQ-2149",
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
    fs.writeFileSync(runId, runId);
    console.log("[Clockify Tempo] Done.");
}).catch((err) => {
    console.trace(err);
});
