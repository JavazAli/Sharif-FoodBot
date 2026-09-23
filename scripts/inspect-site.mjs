import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { chromium } from "playwright-core";

const target = "https://setad.dining.sharif.edu/index.rose";
const runtimeDir = path.resolve(".runtime");
const profileDir = path.join(runtimeDir, "browser-profile");
const networkLog = path.join(runtimeDir, "network.ndjson");
const allowWrite = process.env.SHARIF_ALLOW_WRITE === "1";
const writePattern = /(reserve|reservation|save.*food|food.*save|insert|submit.*meal)/i;

await mkdir(profileDir, { recursive: true });

const context = await chromium.launchPersistentContext(profileDir, {
  channel: "chrome",
  headless: false,
  viewport: null,
  locale: "fa-IR",
});

const page = context.pages()[0] ?? await context.newPage();

await context.route("**/*", async (route) => {
  const request = route.request();
  if (!allowWrite && request.method() !== "GET" && writePattern.test(request.url())) {
    console.warn(`[dry-run] درخواست مشکوک به رزرو مسدود شد: ${request.method()} ${new URL(request.url()).pathname}`);
    await route.abort("blockedbyclient");
    return;
  }
  await route.continue();
});

page.on("response", async (response) => {
  const request = response.request();
  const url = new URL(request.url());
  if (url.hostname !== "setad.dining.sharif.edu") return;
  const event = {
    at: new Date().toISOString(),
    method: request.method(),
    path: url.pathname,
    resourceType: request.resourceType(),
    status: response.status(),
  };
  await appendFile(networkLog, `${JSON.stringify(event)}\n`, "utf8");
});

console.log("مرورگر مشاهده باز شد. ورود را خودتان انجام دهید؛ رمز و محتوای فرم‌ها ثبت نمی‌شود.");
console.log("در حالت پیش‌فرض، درخواست‌های احتمالی رزرو مسدود می‌شوند. برای خروج Enter بزنید.");
await page.goto(target, { waitUntil: "domcontentloaded" });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await new Promise((resolve) => rl.question("", resolve));
rl.close();
await context.close();
