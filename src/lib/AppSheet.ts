// https://www.zenrows.com/blog/headless-browser-nodejs#interact-with-page-elements

import puppeteer from "puppeteer";
import type { WorklogOptions } from "./Worklog.js";

const cache = {
    data: {} as Record<string, any>,
};

let browser: any;

export const login = async (url: string, headless = true) => {
    const args = [
        `--user-data-dir=browser_data`,
        `--profile-directory=Person 1`,
    ];
    console.log("[AppSheet] Opening browser..", { headless, args });
    browser = await puppeteer.launch({
        headless,
        args,
    });
    browser.on("disconnected", () => {
        console.log("[AppSheet] Disconnected.");
    });
    const page = await browser.newPage();

    const storage =() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) as string;
            const value = localStorage.getItem(key);
            data[key] = value as string;
        }
        return data;
    };

    return new Promise((resolve, reject) => {
        page.on("load", () => {
            console.log("[AppSheet] Page loaded", page.url());
            if (page.url().includes(url)) {
                console.log("[AppSheet] Find cookies && localStorage..");
                Promise.all([
                    browser.defaultBrowserContext().cookies(),
                    page.evaluate(storage),
                ])
                .then(([cookies, localStorage]) => {
                    console.log("[AppSheet] Found cookies/localStorage", {
                        cookies: Object.keys(cookies).length,
                        localStorage: Object.keys(localStorage).length,
                    });
                    resolve({ cookies, localStorage });
                    browser.close();
                })
            }
        });
        page.goto(url).then(() => {
            console.log(`[AppSheet] Go to ${url} ..`);
        });
    });
};

export const init = async(url: string) => {
    let result = await Promise.race([
        login(url),
        new Promise(resolve => setTimeout(() => { resolve("timeout") }, 7_000)),
    ]);
    if (result === "timeout") {
        if (browser !== undefined) {
            await browser.close();
        }
        result = await login(url, false) as any;
    }
    cache.data = { ...cache.data, ...(result as any) };

    console.log("[AppSheet]", { cache });
};

interface WorklogEntry extends Omit<WorklogOptions, "issueKey"> {
    // TODO
}

export const log = async(options: WorklogOptions) => {
    // TODO: fetch or browser
};
