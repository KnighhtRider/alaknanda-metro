"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isCMS = path.startsWith("/cms");

  return (
    <>
      {!isCMS && <Navbar />}
      {children}
      {!isCMS && <Footer />}
    </>
  );
}
