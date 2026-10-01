import { test } from "node:test";
import assert from "node:assert/strict";
import { fragment, moduleText, moduleLinks } from "../src/client-config.ts";
test("module uses canonical domain and contains no account credentials", () => {
  const s = moduleText("https://alidns.roayc.com", "reader-test");
  assert(s.startsWith("#!name="));
  for (const section of ["[General]", "[Host]", "[Script]", "[Panel]"])
    assert(s.includes(section));
  assert(s.includes("endpoint=https://alidns.roayc.com/client/selection"));
  assert(s.includes("event-name=engine-started"));
  assert(!s.includes("workers.dev"));
  assert(!s.includes("AccessKey"));
  assert.equal((s.match(/token=reader-test/g) || []).length, 4);
});
test("remote module URL is encoded and Surge install URL round trips", () => {
  const links = moduleLinks("https://alidns.roayc.com", "a+b&c");
  assert.equal(new URL(links.url).searchParams.get("token"), "a+b&c");
  assert.equal(new URL(links.installUrl).searchParams.get("url"), links.url);
  assert(fragment("https://alidns.roayc.com", "reader").includes("[Host]"));
});

test("device reads at 05/20/35/50 and cloud UTC schedule covers Beijing 06/14/22", async () => {
  const { CLOUD_CRON } = await import("../src/core.ts");
  const config = moduleText("https://alidns.roayc.com", "reader");
  assert(config.includes('cronexp="0 5,20,35,50 * * * *"'));
  assert(config.includes("update-interval=900"));
  assert(config.includes("/client/surge.js?v=20261002b"));
  assert.equal(CLOUD_CRON, "0 6,14,22 * * *");
  assert.deepEqual(
    [6, 14, 22].map((x) => (x + 8) % 24).sort((a, b) => a - b),
    [6, 14, 22],
  );
});
