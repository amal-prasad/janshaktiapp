import type { BlockRegistry } from "@/components/blocks/registry";
import News from "@/components/blocks/News";
import Ad from "@/components/blocks/Ad";
import Headlines from "@/components/blocks/Headlines";
import ShortNews from "@/components/blocks/ShortNews";
import Rashifal from "@/components/blocks/Rashifal";
import Calendar from "@/components/blocks/Calendar";

export const BLOCKS: BlockRegistry = {
  news: News,
  ad: Ad,
  headlines: Headlines,
  shortnews: ShortNews,
  rashifal: Rashifal,
  calendar: Calendar,
};
