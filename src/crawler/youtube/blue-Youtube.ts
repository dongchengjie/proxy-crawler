import { Crawler } from "@/crawler/crawler.ts";
// import { charCombinations } from "@/util/password.ts";
import { getBody } from "@/util/http.ts";
// import { runScript } from "@/util/vm.ts";
import * as cheerio from "cheerio";
import { getVideoById, getVideosByChannelId } from "../../util/youtube.ts";
// import CryptoJS from "crypto-js";

export class BlueYoutube extends Crawler {
  public override name(): string {
    return "blue-Youtube";
  }

  public override async getFileContent(): Promise<string | undefined> {
    // 获取视频列表
    const vlr = await getVideosByChannelId("UCtzk4Wh7dwJLDKXbq4w4PRQ");
    if (vlr.status !== 200) return;

    // 获取最新视频id
    const video = vlr.data.items?.find((item) => {
      const clues = ["免费节点", "免费订阅", "节点分享"];
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
    const line = lines.find(
      (line) =>
        line.includes("us1.zhuk.dpdns.org") ||
        line.includes("节点下载：") ||
        line.includes("节点获取地址"),
    );
    const blogUrl = line?.match(/https?:\/\/\S+/)?.[0];
    if (!blogUrl) return;
    this.log(`博客链接: ${blogUrl}`);

    // 获取网页内容
    const blog = await getBody("https://us1.zhuk.dpdns.org/13-Youtube.html");
    if (!blog) return;

    // 获访问密码
    // const $blog = cheerio.load(blog);
    // const es = $blog("#cYaml")
    //   .map((_index, el) => $blog(el).text())
    //   .toArray()
    //   .filter(Boolean)
    //   .find((text) => text.includes("const pwdHash"));
    // const ec = {};
    // runScript(es, ec);

    // // @ts-ignore 获取 `pwdHash` 字段
    // const pwdHash: string = (ec?.pwdHash ?? [])?.find(Boolean);
    // if (!pwdHash) return;
    // this.log(`pwdHash字段: ${pwdHash}`);

    // // 暴力解密
    // const passwords = charCombinations("0123456789", 4, 6);
    // let password: string | undefined;
    // for (const attempt of passwords) {
    //   try {
    //     const hash = CryptoJS.SHA256(attempt).toString();
    //     if (hash === pwdHash) {
    //       password = attempt;
    //       this.log(`访问密码: ${attempt}`);
    //       break;
    //     }
    //   } catch {
    //     // ignore
    //   }
    // }
    // if (!password) return;

    // 获取订阅链接
    const $blog = cheerio.load(blog);
    let subscriptionUrl = $blog("#cYaml")
      .toArray()
      .map((el) => $blog(el).text().trim())
      .find(Boolean);
    subscriptionUrl = subscriptionUrl?.match(/https?:\/\/\S+/)?.[0];
    if (!subscriptionUrl) return;
    this.log(`订阅链接: ${subscriptionUrl}`);

    // 获取订阅内容
    const subscription = await getBody(subscriptionUrl);

    return subscription;
  }
}
