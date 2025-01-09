import { getCrawlers } from "@/crawler/index.ts";
import { env } from "@/util/env.ts";
// @ts-types="npm:@types/fs-extra"
import { outputFileSync } from "fs-extra";
import { resolve } from "node:path";

if (import.meta.main) {
  // Get all enabled crawlers
  const crawlers = getCrawlers().filter((crawler) => crawler.isEnabled());

  // Create crawler tasks
  const tasks = crawlers.map((crawler) => crawler.crawl());

  // Wait for all tasks to complete
  const subscriptionFiles = (await Promise.all(tasks)).filter(Boolean);

  // Write the subscription list to a file
  if (subscriptionFiles.length > 0) {
    const data = subscriptionFiles.join("\n");
    const subscriptionFilePath = resolve(`${env.DESTDIR}.txt`);
    outputFileSync(subscriptionFilePath, data);
  }
}
