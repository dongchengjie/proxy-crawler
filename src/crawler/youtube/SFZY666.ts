import { Crawler } from "@/crawler/crawler.ts";
import { getBody } from "@/util/http.ts";
import { getVideoById, getVideosByChannelId } from "@/util/youtube.ts";
import * as cheerio from "cheerio";

export class SFZY666 extends Crawler {
  public override name(): string {
    return "SFZY666";
  }

  public override async getFileContent(): Promise<string | undefined> {
    // 获取视频列表
    const vlr = await getVideosByChannelId("UCOQ5AdvDNOfyEAJY5SDXVZg");
    if (vlr.status !== 200) return;

    // 获取最新视频id
    const video = vlr.data.items?.find((item) => {
      const clues = ["免费科学上网", "免费节点", "免费订阅"];
      return clues.some((clue) => item?.snippet?.title?.includes(clue));
    });
    const videoId = video?.id?.videoId;
    if (!videoId) return;
    this.log(`最新视频id: ${videoId}`);

    // 获取视频简介
    const vr = await getVideoById(videoId);
    if (vr.status !== 200) return;

    const description = vr?.data?.items?.find(Boolean)?.snippet?.description;
    if (!description) return;

    // 获取博客链接
    const lines = description.split("\n");
    const line = lines.find((line) => line.includes("本期免费节点"));
    const blogUrl = line?.match(/https?:\/\/\S+/)?.[0];
    if (!blogUrl) return;
    this.log(`博客链接: ${blogUrl}`);

    // 获取博客内容
    const blog = await getBody(blogUrl);
    if (!blog) return;

    // 获取订阅链接
    const $blog = cheerio.load(blog);
    let subscriptionUrl = $blog("li")
      .map((_index, el) => $blog(el).text())
      .toArray()
      .filter(Boolean)
      .find((text) => text.includes("20.37版以后"));
    subscriptionUrl = subscriptionUrl?.match(/https?:\/\/\S+/)?.[0];
    if (!subscriptionUrl) return;
    this.log(`订阅链接: ${blogUrl}`);

    // 获取订阅内容
    const subscription = await getBody(subscriptionUrl);

    return subscription;
  }
}
