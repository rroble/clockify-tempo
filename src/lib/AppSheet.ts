// https://www.zenrows.com/blog/headless-browser-nodejs#interact-with-page-elements

import puppeteer from "puppeteer";
import type { WorklogOptions } from "./Worklog.js";

const cache = {
    data: {} as Record<string, any>,
};

let browser: puppeteer.Browser;

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

    const storage = () => {
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
                })
            }
        });
        page.goto(url, { waitUntil: 'domcontentloaded' }).then(() => {
            console.log(`[AppSheet] Go to ${url} ..`);
        });
    });
};

export const close = async() => {
    if (browser) {
        await browser.close();
    }
};

let document: any;

async function getActivePage(browser: puppeteer.Browser, timeout = 5000) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < timeout) {
    const pages = await browser.pages();
    for (const p of pages) {
      if (await p.evaluate(() => document.visibilityState === 'visible')) {
        return p;
      }
    }
  }
  throw "Unable to get active page";
}

export const init = async(url: string, headless?: boolean) => {
    let result = await Promise.race([
        login(url, headless),
        new Promise(resolve => setTimeout(() => { resolve("timeout") }, 7_000)),
    ]);
    if (result === "timeout") {
        if (browser !== undefined) {
            await browser.close();
        }
        result = await login(url, headless || false) as any;
    }
    cache.data = { ...cache.data, ...(result as any) };

    return await getActivePage(browser);
};

interface WorklogEntry extends Omit<WorklogOptions, "issueKey"> {
    // TODO
}

let window: any;

export const log = async(options: WorklogOptions, page: puppeteer.Page) => {
    console.log("page", { url: page.url() });

    // await page.waitForNavigation();

    if (page.url().includes("#")) {
        await page.evaluate(() => { window.onbeforeunload = null; });
        await page.reload({ waitUntil: 'load' });
    }

    const logHoursButton = page.locator('button ::-p-text(Log Hours)');
    console.log({ logHoursButton })
    if (!logHoursButton) {
        console.log("Cannot find + Log Hours button");
        return;
    }
    await logHoursButton?.click();

    const saveButton  = page.locator('button ::-p-text(Save)');
    console.log({ saveButton })
    if (!saveButton) {
        console.log("Cannot find Save button");
        return;
    }
    await page.locator('input[aria-label="WorkDate"]').fill(options.date.format("YYYY-MM-DD"));
    await page.locator('input[aria-label="Project"]').fill("TIQQE");
    await page.keyboard.press('Enter');
    await saveButton?.click();
};
