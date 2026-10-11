import { Hero } from "@/components/sales/Hero";
import { Reviews } from "@/components/sales/Reviews";
import { InsideSixSlot } from "@/components/sales/InsideSixSlot";
import { MeetCoach } from "@/components/sales/MeetCoach";
import { Pricing } from "@/components/sales/Pricing";
import { Faq } from "@/components/sales/Faq";
import { FinalCta } from "@/components/sales/FinalCta";

/** Sales page, sections in the order of brief §3. One job: get people to join. */
export function SalesPage() {
  return (
    <>
      <Hero />
      <Reviews />
      <InsideSixSlot />
      <MeetCoach />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
