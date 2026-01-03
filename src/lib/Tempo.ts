import { Mapping } from "./Mapping.js";
import type { WorklogOptions } from "./Worklog.js";

interface WorklogEntry extends Omit<WorklogOptions, "issueKey"> {
    issueId: number;
    startDate: string;
    startTime: string;
    authorAccountId: string;
}

const worklogsURL = "https://api.tempo.io/4/worklogs";

export const log = async(options: WorklogOptions) => {
    const project = Mapping.get(options.issueKey);
    if (project === undefined) {
        throw new Error(`[Tempo] No mapping for issue: ${options.issueKey}`);
    }

    const worklog: WorklogEntry = {
        ...options,
        startDate: options.date.format("YYYY-MM-DD"),
        startTime: options.date.format("HH:MM:ss"),
        issueId: project.issueId as number,
        description: options.description || project.description || options.issueKey,
        authorAccountId: process.env.JIRA_USER as string,
    };

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

    if (response.status > 299) {
        console.log("[Tempo]", JSON.stringify({ worklog, body }, null, 4));
        throw new Error(`[Tempo] Expecting 2xx status, got ${response.status}`);
    }
    try {
        return JSON.stringify(body);
    } catch (_) {
        // ignore
    }
    return body;
};
