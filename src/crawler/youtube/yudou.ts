import { Crawler } from "@/crawler/crawler.ts";
import { getBody } from "@/util/http.ts";
import * as cheerio from "cheerio";

export class YuDou extends Crawler {
  public override name(): string {
    return "yudou";
  }

  public override async getFileContent(): Promise<string | undefined> {
    // 获取博客列表
    const blogs = await getBody("https://www.yudou789.top/");
    if (!blogs) return;

    // 获取最新博客链接
    const $blogs = cheerio.load(blogs);
    const blogUrl = $blogs("posts .item-body a")
      .toArray()
      .filter((el) => $blogs(el).text().includes("科学上网"))
      .map((el) => $blogs(el).attr("href"))
      .find(Boolean);
    if (!blogUrl) return;
    this.log(`最新博客链接: ${blogUrl}`);

    // 获取博客内容
    const blog = await getBody(blogUrl);
    if (!blog) return;

    // 获取订阅链接
    const $blog = cheerio.load(blog);
    const subscriptionUrl = $blog(".cl-hidden-content p")
      .map((_index, el) => {
        const text = $blog(el).text();
        if (text.toLowerCase().includes("clash")) {
          return text.match(/https?:\/\/\S+/)?.[0];
        }
      })
      .toArray()
      .filter(Boolean)
      .find((text) => text.length > 0);
    if (!subscriptionUrl) return;
    this.log(`订阅链接: ${subscriptionUrl}`);

    // 获取订阅内容
    const subscription = await getBody(subscriptionUrl);

    return subscription;
  }
}
