import { env } from "@/util/env.ts";
import { youtube } from "@googleapis/youtube";

export const youtubeDataAPI = youtube("v3");

export const getVideosByChannelId = async (channelId: string) => {
  return await youtubeDataAPI.search.list({
    part: ["snippet"],
    type: ["video"],
    order: "date",
    channelId,
    key: env.YOUTUBE_DATA_API_KEY,
  });
};

export const getVideoById = async (videoId: string) => {
  return await youtubeDataAPI.videos.list({
    part: ["snippet"],
    id: [videoId],
    key: env.YOUTUBE_DATA_API_KEY,
  });
};
