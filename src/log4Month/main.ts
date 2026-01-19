import "dotenv/config"; // load env first!
import { daily, isHoliday, isVacation } from "./lib.js";
import { Worklog } from "../lib/Worklog.js";
// import * as Tempo from "../lib/Tempo.js";
import * as Clockify from "../lib/Clockify.js";
import * as AppSheet from "../lib/AppSheet.js";
import os from "os";
import fs from "fs";

const days = daily();
if (!days || days.length === 0) {
    console.error("[Clockify Tempo] Cannot identify days, please check env like YEAR, MONTH, SHIFT_START");
    process.exit(1);
}

const runId = ((check = true) => {
    const runId = os.tmpdir() + `/clockify_tempo_${days[0]?.format("YYYY-MM")}_${days.length}`;
    if (!check) {
        return runId;
    }
    if (fs.existsSync(runId)) {
        console.warn(`[Clockify Tempo] ${days[0]?.format("MMMM")} logs exist, aborting to avoid duplicates.`);
        process.exit();
    }
    return runId;
})(false);

(async() => {
    await AppSheet.init(process.env.APP_SHEET_URL as string);

    console.log(`[Clockify Tempo] Logging for whole month of ${days[0]?.format("MMMM")}`);
    for (const day of days) {
        console.log("------", day.toISOString(), "------");
        const worklog = new Worklog({
            issueKey: process.env.JIRA_TICKET as string,
            date: day.utc(),
            timeSpentSeconds: 8.5 * 3600,
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

        const [appSheetResult, clockifyResult] = await Promise.all([
            holiday || vacation || AppSheet.log(worklog.data()),
            "ignored", // Clockify.newEntry(worklog.data()),
        ]);
        console.log(JSON.stringify({ appSheetResult, clockifyResult }, null, 4));
    } // for
})().then(() => {
    fs.writeFileSync(runId, runId);
    console.log("[Clockify Tempo] Done.");
}).catch((err) => {
    console.trace(err);
});
