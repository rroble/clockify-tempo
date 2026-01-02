import type { Moment } from "moment";

export type IssueKey = string | "Holiday" | "Vacation"; 

export interface WorklogOptions {
    issueKey: IssueKey;
    description?: string;
    timeSpentSeconds: number;
    date: Moment;
}

export class Worklog {

    private options: WorklogOptions;

    constructor(options: WorklogOptions) {
        this.options = options;
    }

    public setIssueKey(issueKey: IssueKey) {
        this.options = {
            ...(this.options || {}),
            issueKey,
        };
        return this;
    }

    public setDescription(description: string) {
        this.options = {
            ...(this.options || {}),
            description,
        };
        return this;
    }

    public data() {
        return this.options || {};
    }

}
