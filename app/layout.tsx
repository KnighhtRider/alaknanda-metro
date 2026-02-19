import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { Providers } from "@/utils/providers";
import ClientWrapper from "./ClientWrapper";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"), // 🔁 change after deployment
  title: {
    default: "Metro Advertising Platform | Alaknanda Metro",
    template: "%s | Alaknanda Metro",
  },
  description:
    "Advertise across Delhi Metro stations with high footfall and premium ad inventory. Reach your audience with impactful metro branding.",
  keywords: [
    "Delhi metro advertising",
    "metro ads Delhi",
    "station branding Delhi NCR",
    "outdoor advertising metro",
    "metro hoardings India",
  ],
  openGraph: {
    title: "Metro Advertising Platform | Alaknanda Metro",
    description:
      "Premium metro advertising inventory across Delhi NCR stations.",
    siteName: "Alaknanda Metro",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="">
        <Providers>
          <ClientWrapper>{children}</ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
