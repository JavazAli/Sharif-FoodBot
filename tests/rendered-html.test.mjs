import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Persian food preference app", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]+lang="fa"[^>]+dir="rtl"/i);
  assert.match(html, /<title>لقمه \| انتخاب‌گر هوشمند غذای شریف<\/title>/);
  assert.match(html, /انتخاب‌های این هفته آماده‌اند/);
  assert.match(html, /حالت مشاهده/);
  assert.match(html, /رمز دانشگاه اینجا ذخیره نمی‌شود/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("keeps secrets and local sessions out of source control", async () => {
  const [gitignore, inspector, source] = await Promise.all([
    readFile(new URL("../.gitignore", import.meta.url), "utf8"),
    readFile(new URL("../scripts/inspect-site.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/FoodbotApp.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(gitignore, /\/\.runtime\//);
  assert.match(gitignore, /\*\.har/);
  assert.doesNotMatch(source, /SHARIF_(USERNAME|PASSWORD)/);
  assert.doesNotMatch(inspector, /postData\(|headers\(\)|storageState/);
  assert.match(inspector, /SHARIF_ALLOW_WRITE/);
});
