import { Crawler } from "@/crawler/crawler.ts";
import * as cheerio from "cheerio";
import { runScript } from "@/util/vm.ts";
import { getBody } from "../../util/http.ts";
import { Buffer } from "node:buffer";

export class V2RaySE extends Crawler {
  public override name(): string {
    return "V2RaySE";
  }

  public override getFilename(): string {
    return `${this.name()}.txt`;
  }

  public override async getFileContent(): Promise<string | undefined> {
    // 获取网页内容
    const page = await getBody("https://v2rayse.com/free-node");
    if (!page) return;

    const $page = cheerio.load(page);
    const script = $page("script#__NUXT_DATA__")
      .map((_index, el) => $page(el).text())
      .toArray()
      .filter(Boolean)
      .find((text) => text.length > 0);
    const ctx = {};
    runScript(`var foo = ${script}`, ctx);
    // @ts-ignore 获取 `foo` 字段
    const foo: unknown[] = ctx?.foo ?? [];
    if (!foo) return;

    // 提取 Base64 字符串
    const base64 = foo
      .filter((item) => typeof item === "string")
      .filter((item) => /^[A-Za-z0-9+/=]+$/.test(item))
      .toSorted((a, b) => b.length - a.length)
      .find((item) => item.length > 0);
    if (!base64) return;

    // 解析代理列表
    const proxies = Buffer.from(base64, "base64").toString("utf-8");

    return proxies;
  }
}
