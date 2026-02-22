import { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us | Alaknanda Advertising',
  description: 'Reach out to Alaknanda Advertising for metro advertising rates, premium transit inventory, or to request a free campaign consultation.',
  keywords: 'contact alaknanda advertising, metro advertising rates, transit media booking, advertise in delhi metro',
  openGraph: {
    title: 'Contact Us | Alaknanda Advertising',
    description: 'Reach out to Alaknanda Advertising for metro advertising rates, premium transit inventory, or to request a free campaign consultation.',
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactClient />
}