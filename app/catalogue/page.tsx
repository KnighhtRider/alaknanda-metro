import { Metadata } from 'next'
import CatalogueClient from './CatalogueClient'

export const metadata: Metadata = {
  title: 'Metro Advertising Catalogue | Alaknanda Advertising',
  description: 'Explore the complete directory of Delhi Metro stations and advertising inventory. Browse by line, station type, audience format, and budget.',
  keywords: 'delhi metro advertising catalogue, transit media catalogue, metro station directory, buy metro ads',
  openGraph: {
    title: 'Metro Advertising Catalogue | Alaknanda Advertising',
    description: 'Explore the complete directory of Delhi Metro stations and advertising inventory. Browse by line, station type, audience format, and budget.',
    type: 'website',
  },
}

export default function CataloguePage() {
  return <CatalogueClient />
}