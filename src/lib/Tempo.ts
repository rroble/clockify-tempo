import moment from "moment";
import type { WorklogOptions } from "./Worklog.js";

interface WorklogEntry extends Omit<WorklogOptions, "issueKey"> {
    issueId: number;
    startDate: string;
    startTime: string;
}
const worklogsURL = "https://api.tempo.io/4/worklogs";

// issue key = issue id
const mapping: Record<string, number> = {
    "TIQ-2149": 215050,
};

export const log = async(options: WorklogOptions) => {
    const issueId = mapping[options.issueKey];
    if (issueId === undefined) {
        throw new Error(`No mapping for issue: ${options.issueKey}`);
    }

    const dt = moment(options.date);
    const worklog: WorklogEntry = {
            ...options,
            startDate: dt.format("YYYY-MM-DD"),
            startTime: dt.format("HH:MM:ss"),
            issueId,
            description: options.description || options.issueKey,
        }
    const response = await fetch(worklogsURL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.TEMPO_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(worklog),
    });
    const body = await response.json();
    // console.log(JSON.stringify({ worklog, body }, null, 4));

    if (response.status >= 299) {
        throw new Error(`Expecting 2xx status, got ${response.status}`);
    }
    try {
        return JSON.stringify(body);
    } catch (_) {
        // ignore
    }
    return body;
};
