import { Crawler } from "@/crawler/crawler.ts";
import { getBody } from "@/util/http.ts";
import { getVideoById, getVideosByChannelId } from "@/util/youtube.ts";
import { charCombinations } from "../../util/password.ts";
import { decryptPrivateBin } from "privatebin-decrypt";
import clone from "clone";

export class XQKXW extends Crawler {
  public override name(): string {
    return "XQKXW";
  }

  public override async getFileContent(): Promise<string | undefined> {
    // 获取视频列表
    const vlr = await getVideosByChannelId("UCR3bE81YkAzTUOK2WEiaqZQ");
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

    // 获取paste.to链接
    const line = description
      .split("\n")
      .find((line) => line.includes("https://paste.to"));
    const shareUrl = line?.match(/https?:\/\/\S+/)?.[0];
    if (!shareUrl) return;
    this.log(`paste.to链接: ${shareUrl}`);

    // 获取加密内容
    const data = (await (
      await fetch(shareUrl, {
        headers: { Accept: "application/json, text/javascript, */*; q=0.01" },
      })
    ).json()) as {
      ct: string;
      adata: (string | number | (string | number)[])[];
    };
    const key = shareUrl.substring(shareUrl.lastIndexOf("#") + 1);

    // 暴力解密
    const passwords = charCombinations("0123456789", 4, 4);
    let paste: string | undefined;
    for (const attempt of passwords) {
      try {
        const c_data = clone(data);
        const decrypted = await decryptPrivateBin({
          key,
          data: c_data.adata,
          cipherMessage: c_data.ct,
          password: attempt,
        });
        if (decrypted) {
          paste = decrypted;
          this.log(`访问密码: ${attempt}`);
          break;
        }
      } catch {
        // ignore
      }
    }
    if (!paste) return;

    // 获取订阅链接
    const detail = paste.substring(paste.indexOf("2、clash"));
    const subscriptionUrl = detail?.match(/https?:\/\/\S+/)?.[0];
    if (!subscriptionUrl) return;
    this.log(`订阅链接: ${subscriptionUrl}`);

    // 获取订阅内容
    const subscription = await getBody(subscriptionUrl);

    return subscription;
  }
}
