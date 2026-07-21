import { notFound } from "next/navigation";

import SiteExperience, {
  type SiteExperienceProps,
} from "@/components/SiteExperience";

const channelSources = [
  "wechat",
  "card-a",
  "card-b",
  "firefly",
  "blue-door",
] as const satisfies readonly NonNullable<SiteExperienceProps["source"]>[];

type ChannelSource = (typeof channelSources)[number];

export const dynamicParams = false;

export function generateStaticParams() {
  return channelSources.map((source) => ({ source }));
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source } = await params;

  if (!channelSources.includes(source as ChannelSource)) {
    notFound();
  }

  return <SiteExperience source={source as ChannelSource} />;
}
