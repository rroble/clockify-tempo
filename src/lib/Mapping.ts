import data from "../../mapping.json" with { type: "json" };

export interface ProjectMap {
    // tempo
    issueId?: number;
    description?: string;

    // clockify
    projectId: string;
    taskId?: string;
}

export abstract class Mapping {

    private static data: Record<string, ProjectMap>;

    private static load() {
        if (Mapping.data === undefined) {
            Mapping.data = data;
        }
    }

    public static get(key: string) {
        Mapping.load();
        return Mapping.data[key];
    }
};
