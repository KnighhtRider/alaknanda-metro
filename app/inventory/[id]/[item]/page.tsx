import type { Metadata, ResolvingMetadata } from 'next'
import { prisma } from "@/lib/prisma"
import InventoryClient from "./InventoryClient"

type Props = {
  params: Promise<{ id: string, item: string }>
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  const { id, item } = await props.params;
  const stationId = parseInt(id, 10);
  const productId = parseInt(item, 10);

  if (isNaN(stationId) || isNaN(productId)) {
    return {
      title: 'Not Found | Alaknanda Metro',
    }
  }

  const station = await prisma.station.findUnique({
    where: { id: stationId },
    include: {
      images: true,
      products: {
        where: { productId },
        include: { product: true },
      }
    }
  });

  if (!station || !station.products || station.products.length === 0) {
    return {
      title: 'Inventory Not Found | Alaknanda Metro',
    }
  }

  const sp = station.products[0];
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

export default async function InventoryPage() {
  return <InventoryClient />
}