import moment from "moment";
import type { WorklogOptions } from "./Worklog.js";
import { Mapping } from "./Mapping.js";

interface TimeEntry {
	start: string; // ISO date
	billable: boolean;
	description: string;
    projectId: string;
	taskId: string | undefined;
	end: string; // ISO date
}

const newTimeEntryURL = `https://api.clockify.me/api/v1/workspaces/${process.env.CLOCKIFY_WORKSPACE}/time-entries`;

export const newEntry = async(worklog: WorklogOptions) => {
    const project = Mapping.get(worklog.issueKey);
    if (project === undefined) {
        throw new Error(`[Clockify] No project mapping found for ${worklog.issueKey}`);
    }

	const entry: TimeEntry = {
		projectId: project.projectId,
		taskId: project.taskId,
		billable: (worklog.issueKey != "Holiday"),
		description: worklog.description || project.description || worklog.issueKey,
		start: worklog.date.toISOString(),
		end: worklog.date.add(worklog.timeSpentSeconds, "seconds").toISOString(),
	};

    const response = await fetch(newTimeEntryURL, {
        method: "POST",
        headers: {
            "X-Api-Key": process.env.CLOCKIFY_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(entry),
    });
    const body = await response.json();

    if (response.status > 299) {
        console.log("[Clockify]", JSON.stringify({ newTimeEntryURL, entry, body }, null, 4));
        throw new Error(`[Clockify] Expecting 2xx status, got ${response.status}`);
    }
    try {
        return JSON.stringify(body);
    } catch (_) {
        // ignore
    }
    return body;
};
