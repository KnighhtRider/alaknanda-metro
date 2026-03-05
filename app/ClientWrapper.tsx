"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PlanProvider } from "@/context/PlanContext";
import PopupContact from "@/components/PopupContact";
import PlanDrawer from "@/components/PlanDrawer";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isCMS = path.startsWith("/cms");

  return (
    <PlanProvider>
      {!isCMS && <Navbar />}
      {children}
      {!isCMS && <Footer />}
      {!isCMS && <PopupContact />}
      {!isCMS && <PlanDrawer />}
    </PlanProvider>
  );
}
