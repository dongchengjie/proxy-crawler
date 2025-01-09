import { type Crawler } from "@/crawler/crawler.ts";
import { BlueYoutube } from "@/crawler/youtube/blue-Youtube.ts";
import { SFZY666 } from "@/crawler/youtube/SFZY666.ts";
import { YuDou } from "@/crawler/youtube/yudou.ts";

export const getCrawlers = (): Crawler[] => {
  return [BlueYoutube, SFZY666, YuDou].map((Crawler) => new Crawler());
};
