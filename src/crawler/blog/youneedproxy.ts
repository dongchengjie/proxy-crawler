import { Crawler } from "@/crawler/crawler.ts";
import * as cheerio from "cheerio";
import { runScript } from "@/util/vm.ts";
import { createWorker } from "tesseract.js";
import { Jimp } from "jimp";
import { URLSearchParams } from "node:url";

export class Youneedproxy extends Crawler {
  public override name(): string {
    return "youneedproxy";
  }

  public override getFilename(): string {
    return `${this.name()}.txt`;
  }

  public override async getFileContent(): Promise<string | undefined> {
    // 获取并记录 PHPSESSID
    const listUrl = "https://www.youneed.win/category/nodeshare";
    const res = await fetch(listUrl);
    const phpSessionId = res.headers
      .getSetCookie()
      .join(";")
      .match(/PHPSESSID=([^;]+)/)?.[1];
    if (!phpSessionId) return;
    this.log(`PHPSESSID: ${phpSessionId}`);

    // 获取博客列表
    const blogs = await res.text();
    if (!blogs) return;

    // 获取最新博客链接
    const $blogs = cheerio.load(blogs);
    const blogUrl = $blogs(".list-body > a")
      .toArray()
      .filter((el) => $blogs(el).text().includes("免费"))
      .map((el) => $blogs(el).attr("href"))
      .find(Boolean);
    if (!blogUrl) return;
    this.log(`最新博客链接: ${blogUrl}`);

    // 获取博客内容
    const blog = await fetch(blogUrl, {
      method: "GET",
      headers: {
        origin: "https://www.youneed.win",
        referer: listUrl,
        Cookie: `PHPSESSID=${phpSessionId}`,
      },
    }).then((response) => response.text());
    if (!blog) return;

    // 获取认证参数脚本
    const script = blog
      .split("\n")
      .find((line) => line.includes("var captcha_ajax"));
    if (!script) return;

    const context = {};
    runScript(script, context);

    type CaptchaAjax = { ajax_url: string; nonce: string };
    // @ts-ignore 获取 `captcha_ajax` 字段
    const captcha_ajax: CaptchaAjax = context?.captcha_ajax ?? undefined;
    if (!captcha_ajax) return;
    this.log(`认证参数: ${JSON.stringify(captcha_ajax)}`);

    const $blog = cheerio.load(blog);
    // 获取资源ID
    const contentId = $blog(".submit-captcha")
      .toArray()
      .map((el) => $blog(el).attr("data-content-id"))
      .find(Boolean);
    if (!contentId) return;
    this.log(`资源ID: ${contentId}`);

    const getProxies = async () => {
      // 获取验证码图片Base64串
      const getCaptcha = async () => {
        const data = new URLSearchParams();
        data.append("action", "refresh_captcha");
        data.append("nonce", captcha_ajax.nonce);
        const json = await fetch(captcha_ajax.ajax_url, {
          method: "POST",
          headers: {
            origin: "https://www.youneed.win",
            referer: blogUrl,
            Cookie: `PHPSESSID=${phpSessionId}`,
          },
          body: data,
        }).then((response) => response.json());
        return json?.success ? json.data.svg : undefined;
      };
      const $img = cheerio.load(await getCaptcha());
      const captchaBase64 = $img("img")
        .toArray()
        .map((el) => $img(el).attr("src"))
        .find(Boolean);
      if (!captchaBase64) return;

      // 识别验证码
      const recognizeCaptcha = async (url: string) => {
        const image = await Jimp.read(url);
        image
          .greyscale() // 转为灰度图
          .contrast(0.9) // 增强对比度
          .write("gray_captcha.png"); // 保存预处理后的图像

        let worker;
        try {
          worker = await createWorker("eng");
          const result = await worker.recognize("gray_captcha.png");
          return result.data.text.replace(/\D/g, "");
        } finally {
          worker?.terminate();
        }
      };
      const captchaText = await recognizeCaptcha(captchaBase64);
      if (!captchaText) return;
      this.log(`验证码: ${captchaText}`);

      const data = new URLSearchParams();
      data.append("action", "verify_captcha");
      data.append("nonce", captcha_ajax.nonce);
      data.append("captcha", captchaText);
      data.append("content_id", contentId);
      const json = await fetch(captcha_ajax.ajax_url, {
        method: "POST",
        headers: {
          origin: "https://www.youneed.win",
          referer: blogUrl,
          Cookie: `PHPSESSID=${phpSessionId}`,
        },
        body: data,
      }).then((response) => response.json());
      return json?.success ? json.data.content : undefined;
    };

    // 验证码识别存在失败的可能，增加重试机制
    const proxiesContent = await (async () => {
      const maxRetries = 100;
      let retries = 0;
      let proxies;
      while (retries < maxRetries) {
        proxies = await getProxies();
        if (proxies) return proxies;
        retries++;
      }
    })();

    // 解析代理列表
    const $proxies = cheerio.load(`<div>${proxiesContent}</div>`);
    const proxies = $proxies("pre")
      .toArray()
      .map((el) => $proxies(el).text().trim())
      .filter(Boolean)
      .join("\n");

    return proxies;
  }
}
