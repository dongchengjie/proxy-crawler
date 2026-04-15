import { Crawler } from "@/crawler/crawler.ts";
// import { charCombinations } from "@/util/password.ts";
import { getBody } from "@/util/http.ts";
// import { runScript } from "@/util/vm.ts";
import * as cheerio from "cheerio";
// import CryptoJS from "crypto-js";

export class BlueYoutube extends Crawler {
  public override name(): string {
    return "blue-Youtube";
  }

  public override async getFileContent(): Promise<string | undefined> {
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
