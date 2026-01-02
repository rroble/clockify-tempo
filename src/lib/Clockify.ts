import moment from "moment";
import type { WorklogOptions } from "./Worklog.js";

interface TimeEntry {
	start: string; // ISO date
	billable: boolean;
	description: string;
    projectId: string;
	taskId: string | undefined;
	end: string; // ISO date
}

interface ProjectMap {
    projectId: string;
    taskId?: string;
}

const mapping: Record<string, ProjectMap> = {
	"TIQ-2149": {
		projectId: "677e46d7989ab45f82352658",
        // no taskId
	},
	"Holiday": {
		// Furlough
		projectId: "66fcfb42f79ac60fefe95aef",
		taskId: "66fcfb4f4f6e7d7b58122791",
	},
	"Vacation": {
		projectId:        "66fcfb42f79ac60fefe95aef",
		taskId:           "66fcfb55f79ac60fefe95cae",
	},
}

const caculateEnd = (start: string, timeSpentSeconds: number) => {
    const dt = moment(start);
    dt.add(timeSpentSeconds, "seconds");
    return dt.utc().toISOString();
};

const newTimeEntryURL = `https://api.clockify.me/api/v1/workspaces/${process.env.CLOCKIFY_WORKSPACE}/time-entries`;

export const newEntry = async(worklog: WorklogOptions) => {
    const project = mapping[worklog.issueKey];
    if (project === undefined) {
        throw new Error(`No project mapping found for ${worklog.issueKey}`);
    }

	const entry: TimeEntry = {
		projectId: project.projectId,
		taskId: project.taskId,
		billable: (worklog.issueKey != "Holiday"),
		description: worklog.description || "PN Sesam",
		start: worklog.date,
		end: caculateEnd(worklog.date, worklog.timeSpentSeconds),
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
    // console.log(JSON.stringify({ newTimeEntryURL, entry, body }, null, 4));

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
