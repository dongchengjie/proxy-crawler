import { Crawler } from "@/crawler/crawler.ts";
import { charCombinations } from "@/util/password.ts";
import { getBody } from "@/util/http.ts";
import { runScript } from "@/util/vm.ts";
import * as cheerio from "cheerio";
// @ts-types="npm:@types/crypto-js"
import CryptoJS from "crypto-js";

export class BlueYoutube extends Crawler {
  public override name(): string {
    return "blue-Youtube";
  }

  public override async getFileContent(): Promise<string | undefined> {
    // 获取博客列表
    const blogs = await getBody("https://blues2022.blogspot.com/");
    if (!blogs) return;

    // 获取最新博客链接
    const $blogs = cheerio.load(blogs);
    const blogUrl = $blogs(".entry-title > a")
      .toArray()
      .filter((el) => $blogs(el).text().includes("免费节点"))
      .map((el) => $blogs(el).attr("href"))
      .find(Boolean);
    if (!blogUrl) return;
    this.log(`最新博客链接: ${blogUrl}`);

    // 获取博客内容
    const blog = await getBody(blogUrl);
    if (!blog) return;

    // 获取订阅链接加密后的内容
    const $blog = cheerio.load(blog);
    const es = $blog("script")
      .map((_index, el) => $blog(el).text())
      .toArray()
      .filter(Boolean)
      .find((text) => text.includes("var encryption"));
    const ec = {};
    runScript(es, ec);

    // @ts-ignore 获取 `encryption` 字段
    const encryption: string = (ec?.encryption ?? [])?.find(Boolean);
    if (!encryption) return;
    this.log(`encryption字段: ${encryption}`);

    // 暴力解密
    const passwords = charCombinations("0123456789", 4, 6);
    let decryption: string | undefined;
    for (const attempt of passwords) {
      try {
        const aes = CryptoJS.AES.decrypt(encryption, attempt);
        const decoded = (decryption = decodeURIComponent(
          aes.toString(CryptoJS.enc.Utf8),
        ));
        if (decoded != null && decoded.length > 0) {
          decryption = decoded;
          this.log(`解密密码: ${attempt}`);
          break;
        }
      } catch {
        // ignore
      }
    }
    if (!decryption) return;

    // 获取订阅链接
    const $decryption = cheerio.load(decryption);
    let subscriptionUrl = $decryption("div")
      .toArray()
      .map((el) => {
        if ($decryption(el).text().toLowerCase().includes("clash")) {
          return $decryption(el).next("div").text();
        }
      })
      .find(Boolean);
    subscriptionUrl = subscriptionUrl?.match(/https?:\/\/\S+/)?.[0];
    if (!subscriptionUrl) return;
    this.log(`订阅链接: ${subscriptionUrl}`);

    // 获取订阅内容
    const subscription = await getBody(subscriptionUrl);

    return subscription;
  }
}
