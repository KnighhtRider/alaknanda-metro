import type { Metadata } from 'next'
import { prisma } from "@/lib/prisma"
import StationClient from "./StationClient"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  const { id } = await props.params;
  const stationId = parseInt(id, 10);

  if (isNaN(stationId)) {
    return {
      title: 'Station Not Found | Alaknanda Metro',
    }
  }

  const station = await prisma.station.findUnique({
    where: { id: stationId },
    include: { images: true }
  });

  if (!station) {
    return {
      title: 'Station Not Found | Alaknanda Metro',
    }
  }

  const thumbnail = station.images?.[0]?.imageUrl || undefined;

  return {
    title: `Metro Advertising in ${station.name} | Alaknanda Advertising`,
    description: station.description || `Explore premium advertising opportunities, available ad units, and reach high footfall at ${station.name} metro station.`,
    keywords: `metro advertising ${station.name}, ${station.name} metro ads, transit advertising, metro train ads, Alaknanda Advertising`,
    openGraph: {
      title: `Metro Advertising in ${station.name}`,
      description: station.description || `Explore premium advertising opportunities, available ad units, and reach high footfall at ${station.name} metro station.`,
      images: thumbnail ? [thumbnail] : [],
      type: "website",
    },
    twitter: {
      card: 'summary_large_image',
      title: `Metro Advertising in ${station.name}`,
      description: station.description || `Explore premium advertising opportunities at ${station.name} metro station.`,
      images: thumbnail ? [thumbnail] : [],
    }
  }
}

export default async function StationPage() {
  return <StationClient />
}