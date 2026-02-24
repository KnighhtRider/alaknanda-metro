import type { Metadata } from 'next'
import { prisma } from "@/lib/prisma"
import StationClient from "@/app/station/[id]/StationClient"
import { notFound } from "next/navigation"
import { toSlug } from "@/lib/slugify"

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(
    props: Props,
): Promise<Metadata> {
    const { slug } = await props.params;

    const stations = await prisma.station.findMany({ select: { id: true, name: true, description: true, images: true } });

    const station = stations.find(s => toSlug(s.name) === slug);

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

export default async function StationSlugPage(props: Props) {
    const { slug } = await props.params;

    const stations = await prisma.station.findMany({ select: { id: true, name: true } });
    const station = stations.find(s => toSlug(s.name) === slug);

    if (!station) {
        notFound();
    }

    return <StationClient initialStationId={station.id} />
}
