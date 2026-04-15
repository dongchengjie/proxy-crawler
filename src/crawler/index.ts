import { type Crawler } from "@/crawler/crawler.ts";
import { BlueYoutube } from "@/crawler/youtube/blue-Youtube.ts";
import { SFZY666 } from "@/crawler/youtube/SFZY666.ts";
import { YuDou } from "@/crawler/youtube/yudou.ts";
import { QFZYFX } from "@/crawler/youtube/QFZYFX.ts";
import { XQKXW } from "@/crawler/youtube/XQKXW.ts";
import { Youneedproxy } from "@/crawler/blog/youneedproxy.ts";

export const getCrawlers = (): Crawler[] => {
  return [BlueYoutube, SFZY666, YuDou, QFZYFX, XQKXW, Youneedproxy].map(
    (Crawler) => new Crawler(),
  );
};
