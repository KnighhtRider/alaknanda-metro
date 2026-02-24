import type { Metadata } from 'next'
import { prisma } from "@/lib/prisma"
import InventoryClient from "@/app/inventory/[id]/[item]/InventoryClient"
import { notFound } from "next/navigation"
import { toSlug } from "@/lib/slugify"

type Props = {
    params: Promise<{ slug: string, product: string }>
}

export async function generateMetadata(
    props: Props,
): Promise<Metadata> {
    const { slug, product: productSlug } = await props.params;

    const stations = await prisma.station.findMany({
        include: {
            images: true,
            products: {
                include: { product: true }
            }
        }
    });

    const station = stations.find(s => toSlug(s.name) === slug);

    if (!station) {
        return {
            title: 'Not Found | Alaknanda Metro',
        }
    }

    const sp = station.products.find(p => toSlug(p.product.name) === productSlug);

    if (!sp) {
        return {
            title: 'Inventory Not Found | Alaknanda Metro',
        }
    }

    const productName = sp.product.name;
    const thumbnail = sp.product.thumbnail || station.images?.[0]?.imageUrl || undefined;

    const title = `${productName} Advertising at ${station.name} | Alaknanda Advertising`;
    const description = `Book ${productName} ads at ${station.name} Metro Station. Reach ${station.footfall || 'high footfall'} commuters daily with premium advertising spaces.`;

    return {
        title,
        description,
        keywords: `${productName.toLowerCase()} advertising ${station.name}, ${station.name} ${productName.toLowerCase()}, transit advertising, metro train ads, Alaknanda Advertising`,
        openGraph: {
            title,
            description,
            images: thumbnail ? [thumbnail] : [],
            type: "website",
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: thumbnail ? [thumbnail] : [],
        }
    }
}

export default async function InventorySlugPage(props: Props) {
    const { slug, product: productSlug } = await props.params;

    const stations = await prisma.station.findMany({ include: { products: { include: { product: true } } } });

    const station = stations.find(s => toSlug(s.name) === slug);
    if (!station) notFound();

    const sp = station.products.find(p => toSlug(p.product.name) === productSlug);
    if (!sp) notFound();

    return <InventoryClient initialStationId={station.id} initialProductId={sp.product.id} />
}
